// Types
import { PagePresenceTarget } from "../types/PagePresence";

/**
 * Which patient tabs count as being "in the same record".
 *
 * All four share one presence key, so someone correcting a spelling on Personal
 * is visible to someone taking vitals on General -- they are one record and one
 * patient, and the whole point is to know a colleague is in there with you.
 * The label is what distinguishes them once you can see each other.
 */
const PATIENT_SEGMENTS: Record<string, string> = {
  "patient-summary": "Summary",
  "patient-general": "General",
  "patient-dentistry": "Dental",
  "patient-personal": "Personal",
};

/**
 * Project-level screens, where the shared thing is the mission rather than one
 * patient.
 */
const PROJECT_SEGMENTS: Record<string, string> = {
  "project-patients": "Patients",
};

/**
 * The record the current URL is looking at, or nothing if the URL is not one
 * two people can collide on.
 *
 * Derived from the pathname rather than passed down, so a page opts in by
 * existing at a known route instead of by wiring a component -- the same way
 * the header already decides where Back should go. Adding a screen is a line in
 * one of the maps above.
 *
 * Sign-in, the dashboard and the standalone forms deliberately return nothing:
 * a roster on a screen nobody shares is noise, and no heartbeat means no write.
 */
export const getPagePresenceTarget = (
  pathname: string,
): PagePresenceTarget | undefined => {
  const [, segment, id] = pathname.split("/");

  if (!segment || !id) {
    return undefined;
  }

  const patientLabel = PATIENT_SEGMENTS[segment];

  if (patientLabel) {
    return {
      resourceKey: `patient:${id}`,
      resourceLabel: patientLabel,
      scope: { patientPersonalId: id },
    };
  }

  const projectLabel = PROJECT_SEGMENTS[segment];

  if (projectLabel) {
    return {
      resourceKey: `${segment}:${id}`,
      resourceLabel: projectLabel,
      scope: { projectId: id },
    };
  }

  return undefined;
};
