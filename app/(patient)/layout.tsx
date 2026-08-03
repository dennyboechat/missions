"use client";

// Multivariate Dependencies
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

// Components
import { SideMenuLayout } from "../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../components/PatientMenuItems";
import { PatientQrCode } from "../components/PatientQrCode";

// Hooks
import { PatientProvider } from "../lib/PatientContext";
import { useLiveData } from "../lib/useLiveData";
import { useProjectFormats } from "../lib/useProjectFormats";

// Database
import { getPatientSummary } from "../database/patient-summary/GetPatientSummary";

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
  const [, segment, patientPersonalId] = pathname.split("/");
  const activeMenuItem = MENU_ITEM_BY_SEGMENT[segment];

  const [patient, setPatient] = useState<PatientPersonalSummary>();

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

      const summary = actionData(
        await getPatientSummary({ patientPersonalId }),
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
  }, [patientPersonalId]);

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
      header={patient?.patientFullName ?? ""}
      subHeader={getSideMenuSubHeader({
        patientDateOfBirth: patient?.patientDateOfBirth,
        dateFormat,
      })}
      subHeaderFooter={getSideMenuSubHeaderFooter({
        isPatientMale: patient?.isPatientMale,
      })}
      // The id comes out of the URL, so the code is drawn on the first paint
      // rather than waiting on the summary the name arrives with.
      headerExtra={
        <PatientQrCode
          patientPersonalId={patientPersonalId}
          patientFullName={patient?.patientFullName}
        />
      }
      isBoldHeader
    >
      <PatientProvider value={{ patient, setPatient }}>
        {children}
      </PatientProvider>
    </SideMenuLayout>
  );
}
