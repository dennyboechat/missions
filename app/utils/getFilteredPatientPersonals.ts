"use client";

// Types
import { PatientPersonalTypes } from "../types/PatientPersonalTypes";

// Utils
import { getParsedCharacterText } from "./getParsedCharacterText";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";

export const getFilteredPatientPersonals = ({
  patientPersonals,
  filterText,
}: {
  patientPersonals: PatientPersonalTypes[];
  filterText?: string;
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
          getLocaleFormattedDate({
            date: patientPersonal.patientDateOfBirth,
          }).includes(filterText.toLowerCase())
        ) {
          patientPersonal.filterOrder = 3;
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
