// Utils
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";
import { joinWithAnd } from "./joinWithAnd";

// Types
import { PatientPersonalTypes } from "../types/PatientPersonalTypes";

/**
 * Wording for the "this name is already registered" warning shown while a new
 * patient is being added. The dates of birth are what let the user tell a
 * genuine namesake from a duplicate, so they are always spelled out.
 *
 * Returns an empty string when there is nothing to warn about, so callers can
 * use the result as the whole condition for rendering the warning.
 */
export const getDuplicatePatientWarning = ({
  patientFullName,
  duplicatePatientPersonals,
}: {
  patientFullName?: string;
  duplicatePatientPersonals: PatientPersonalTypes[];
}) => {
  if (!patientFullName || duplicatePatientPersonals.length === 0) {
    return "";
  }

  const datesOfBirth = duplicatePatientPersonals.map(({ patientDateOfBirth }) =>
    getLocaleFormattedDate({ date: patientDateOfBirth })
  );

  if (datesOfBirth.length === 1) {
    return (
      `A patient named "${patientFullName.trim()}" is already registered in this ` +
      `project, with date of birth ${datesOfBirth[0]}. ` +
      `Please check this is not a duplicate.`
    );
  }

  return (
    `${datesOfBirth.length} patients named "${patientFullName.trim()}" are already ` +
    `registered in this project, with dates of birth ${joinWithAnd(datesOfBirth)}. ` +
    `Please check this is not a duplicate before confirming.`
  );
};
