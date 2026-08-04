"use client";

// Multivariate Dependencies
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

// Components
import { SideMenuLayout } from "../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../components/PatientMenuItems";
import { PatientQrCode } from "../components/PatientQrCode";
import { PatientLabelDialog } from "../components/PatientLabel";

// Hooks
import { PatientProvider } from "../lib/PatientContext";
import { useLiveData } from "../lib/useLiveData";
import { useProjectFormats } from "../lib/useProjectFormats";
import { useProject } from "../lib/ProjectContext";
import {
  recallPatientSummary,
  startPatientSummary,
} from "../lib/patientSummaryRequest";

// Database
import { getPatientSummary } from "../database/patient-summary/GetPatientSummary";
import { getProject } from "../database/project/GetProject";

// Types
import { PatientPersonalSummary } from "../types/PatientPersonalSummary";
import { PatientMenuItemsProps } from "../components/PatientMenuItems/types/PatientMenuItemsProps";
import { actionData } from "../types/ActionResult";

// Utils
import { getSideMenuSubHeader } from "../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../utils/getSideMenuSubHeaderFooter";

type ActiveMenuItem = PatientMenuItemsProps["activeMenuItem"];

const MENU_ITEM_BY_SEGMENT: Record<string, ActiveMenuItem> = {
  "patient-summary": "patient-summary",
  "patient-general": "patient-general",
  "patient-dentistry": "patient-dentistry",
  "patient-personal": "patient-personal",
};

/**
 * The chrome for every patient page: the sidebar, the patient's name and the
 * tab menu.
 *
 * It lives in a layout rather than in each page so that moving between tabs
 * swaps only the content. When each page rendered its own copy, React tore the
 * menu down and rebuilt it on every click -- which read as a page refresh, and
 * made a quick second click land on whichever item had shifted under the
 * cursor.
 *
 * The route group keeps the URLs exactly as they were.
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { dateFormat } = useProjectFormats();
  const { project, setProject } = useProject();
  const [, segment, patientPersonalId] = pathname.split("/");
  const activeMenuItem = MENU_ITEM_BY_SEGMENT[segment];

  /* Opened from the patients list, the sidebar is filled in on the first paint:
   * that list has already read every field shown here, and the row clicked is the
   * row that was being read a moment ago. The record's own read still follows and
   * still wins -- this only covers the interval before it lands. */
  const [patient, setPatient] = useState<PatientPersonalSummary | undefined>(
    () => recallPatientSummary(patientPersonalId),
  );

  /* Opened cold -- a scanned code, a pasted link, a reload -- there is nothing
   * remembered and the read has to happen, so it is started here in the render
   * rather than in the effect below. Effects run child first, which put this one
   * behind every query the page underneath fires; renders run parent first, which
   * puts it in front of them. See startPatientSummary.
   *
   * Not started when the sidebar already has this patient: there is nothing left
   * to hurry, and the queue is better spent on the page's own data, which is then
   * the only thing anyone is still waiting for. */
  const hasPatient = patient?.patientPersonalId === patientPersonalId;

  /* Held in a ref, and this is the part that matters: exactly one read per record,
   * however many times this renders.
   *
   * Keying off "no patient yet" alone is not enough, because a record that comes
   * back with nothing -- deleted, or one this user may not see -- leaves that
   * condition true forever, and a request started in a render that never stops
   * being needed is a request on every render. The ref answers "already asked
   * about this id", which stays true whatever the answer was.
   *
   * It also keeps the promise for the effect below. Computing it into a local
   * would lose it on any re-render between here and there, and the effect would
   * fall back to reading the record a second time. */
  const requestRef = useRef<{
    patientPersonalId?: string;
    request?: ReturnType<typeof startPatientSummary>;
  }>({});

  if (
    !hasPatient &&
    patientPersonalId &&
    requestRef.current.patientPersonalId !== patientPersonalId
  ) {
    requestRef.current = {
      patientPersonalId,
      request: startPatientSummary(patientPersonalId),
    };
  }

  const startedRequest =
    requestRef.current.patientPersonalId === patientPersonalId
      ? requestRef.current.request
      : undefined;

  /* What the sidebar draws. The layout outlives a patient -- moving between two
   * records keeps it mounted and only changes the id -- so on that move the state
   * still holds the previous patient, and this falls back to what the list knew
   * about the new one rather than showing the old one's name over the new one's
   * record. */
  const shownPatient = hasPatient
    ? patient
    : recallPatientSummary(patientPersonalId);

  // Which project this layout has already asked for, so a render while that
  // request is in flight does not start a second one.
  const adoptedProjectIdRef = useRef<string | undefined>(undefined);

  // The last summary the server sent. The personal tab edits this same value
  // through the context, so this is the baseline that says whether the copy on
  // screen is the server's or someone's unsaved edit.
  const lastRemotePatientRef = useRef<PatientPersonalSummary | undefined>(
    undefined,
  );

  useEffect(() => {
    let isCurrent = true;

    const loadPatient = async () => {
      if (!patientPersonalId) return;

      // The request the render above already started, where there was one. Both
      // of development's two effect passes await the same promise, so the record
      // is read once either way.
      const summary = actionData(
        await (startedRequest ?? getPatientSummary({ patientPersonalId })),
      );

      // Ignore a response for a patient the user has already navigated away
      // from.
      if (isCurrent) {
        lastRemotePatientRef.current = summary;
        setPatient(summary);
      }
    };

    loadPatient();

    return () => {
      isCurrent = false;
    };
    // startedRequest is deliberately not a dependency: it is the request for this
    // patient, and re-running on a new promise identity would read the record
    // twice. The id is what decides whether this has to happen again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientPersonalId]);

  /* The patient's own project, adopted as the one in hand.
   *
   * A patient page is reachable without going through the picker: the QR code on
   * this sidebar is scanned on a phone that has never chosen a project, and
   * arrives here straight from signing in. The project is where the units and the
   * date order are recorded, so with an empty context the record read in the
   * shipped defaults -- centimetres and mm/dd/yyyy -- for a mission that may
   * write neither. A figure captioned with the wrong unit is worse than no
   * figure, and this is a record someone is being handed at the chair.
   *
   * Adopting rather than reading it aside deliberately: the scanner is now
   * working in this project, and the rest of the app -- the sidebar, the reports,
   * the patients list they reach with Back -- should agree with the record in
   * front of them. Access is still the server's to decide; getProject refuses a
   * project the caller is not a member of, and the patient summary above is
   * gated the same way. */
  useEffect(() => {
    let isCurrent = true;

    const adoptPatientProject = async () => {
      const patientProjectId = shownPatient?.projectId;

      // Already in hand. The rank has to be there too: a project cached without
      // one answers the menu's owner-only question wrongly, the same reason the
      // project layout re-fetches for it.
      const isCurrentProject =
        project?.projectId === patientProjectId &&
        project?.viewerRole !== undefined;

      if (!patientProjectId || isCurrentProject) return;
      if (adoptedProjectIdRef.current === patientProjectId) return;

      adoptedProjectIdRef.current = patientProjectId;

      const loaded = actionData(await getProject({ projectId: patientProjectId }));

      if (isCurrent && loaded) {
        setProject(loaded);
      }
    };

    adoptPatientProject();

    return () => {
      isCurrent = false;
    };
  }, [
    shownPatient?.projectId,
    project?.projectId,
    project?.viewerRole,
    setProject,
  ]);

  // Someone correcting a spelling on the personal tab should show up in this
  // sidebar on every other tab, and on everyone else's screen.
  const refreshPatient = useCallback(
    () => getPatientSummary({ patientPersonalId }),
    [patientPersonalId],
  );

  useLiveData({
    load: refreshPatient,
    apply: (result) => {
      const summary = actionData(result);

      if (!summary) return;

      const lastRemotePatient = lastRemotePatientRef.current;

      lastRemotePatientRef.current = summary;

      setPatient((localPatient) => {
        // An edit made on the personal tab has not necessarily reached the
        // database yet, and it is the newer of the two. Leave it be; the save
        // it is waiting on will make the two agree.
        const hasLocalEdit =
          localPatient?.patientFullName !== lastRemotePatient?.patientFullName ||
          localPatient?.isPatientMale !== lastRemotePatient?.isPatientMale ||
          localPatient?.patientDateOfBirth !==
            lastRemotePatient?.patientDateOfBirth;

        return hasLocalEdit ? localPatient : summary;
      });
    },
    enabled: Boolean(patientPersonalId),
  });

  return (
    <SideMenuLayout
      menuItems={
        <PatientMenuItems
          patientPersonalId={patientPersonalId}
          activeMenuItem={activeMenuItem}
        />
      }
      header={shownPatient?.patientFullName ?? ""}
      subHeader={getSideMenuSubHeader({
        patientDateOfBirth: shownPatient?.patientDateOfBirth,
        dateFormat,
      })}
      subHeaderFooter={getSideMenuSubHeaderFooter({
        isPatientMale: shownPatient?.isPatientMale,
      })}
      // The id comes out of the URL, so the code is drawn on the first paint
      // rather than waiting on the summary the name arrives with. Clicking it
      // opens the card the patient carries away, which does wait: it is the
      // record's details, and they arrive with the summary.
      headerExtra={
        <PatientLabelDialog
          patientPersonalId={patientPersonalId}
          patient={shownPatient}
          projectName={project?.projectName}
        >
          <PatientQrCode
            patientPersonalId={patientPersonalId}
            patientFullName={shownPatient?.patientFullName}
          />
        </PatientLabelDialog>
      }
      isBoldHeader
    >
      <PatientProvider value={{ patient, setPatient }}>
        {children}
      </PatientProvider>
    </SideMenuLayout>
  );
}
