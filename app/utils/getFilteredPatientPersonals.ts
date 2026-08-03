"use client";

// Types
import { PatientPersonalTypes } from "../types/PatientPersonalTypes";
import { ProjectDateFormat } from "../types/ProjectTypes";

// Utils
import { getParsedCharacterText } from "./getParsedCharacterText";
import { formatProjectDate } from "./projectFormats";

export const getFilteredPatientPersonals = ({
  patientPersonals,
  filterText,
  dateFormat,
}: {
  patientPersonals: PatientPersonalTypes[];
  filterText?: string;
  /**
   * The project's date order. Search matches against the date as displayed, so
   * typing "03/04" has to find whatever the list is actually showing.
   */
  dateFormat: ProjectDateFormat;
}): PatientPersonalTypes[] => {
  let sortedPatientPersonals: PatientPersonalTypes[] = [];

  if (patientPersonals && patientPersonals.length) {
    if (filterText && filterText.length) {
      patientPersonals.forEach((patientPersonal) => {
        if (
          getParsedCharacterText({
            text: patientPersonal.patientFullName,
          }).startsWith(filterText.toLowerCase())
        ) {
          patientPersonal.filterOrder = 1;
          sortedPatientPersonals.push(patientPersonal);
        } else if (
          getParsedCharacterText({
            text: patientPersonal.patientFullName,
          }).includes(filterText.toLowerCase())
        ) {
          patientPersonal.filterOrder = 2;
          sortedPatientPersonals.push(patientPersonal);
        } else if (
          formatProjectDate({
            date: patientPersonal.patientDateOfBirth,
            dateFormat,
          }).includes(filterText.toLowerCase())
        ) {
          patientPersonal.filterOrder = 3;
          sortedPatientPersonals.push(patientPersonal);
        } else if (
          getParsedCharacterText({
            text: patientPersonal.patientPhoneNumber,
          }).includes(filterText.toLowerCase())
        ) {
          patientPersonal.filterOrder = 4;
          sortedPatientPersonals.push(patientPersonal);
        }
      });

      sortedPatientPersonals.sort(
        (a, b) => (a.filterOrder ?? 0) - (b.filterOrder ?? 0)
      );
    } else {
      sortedPatientPersonals = patientPersonals;
    }
  }

  return sortedPatientPersonals;
};
