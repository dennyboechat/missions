import { describe, it, expect } from "vitest";

import { getDuplicatePatientWarning } from "../getDuplicatePatientWarning";

// Types
import { PatientPersonalTypes } from "../../types/PatientPersonalTypes";

const patientWithDateOfBirth = (
  patientDateOfBirth: string,
): PatientPersonalTypes => ({
  patientPersonalId: patientDateOfBirth,
  projectId: "project-1",
  patientFullName: "Ana Silva",
  isPatientMale: false,
  patientDateOfBirth,
  patientPhoneNumber: "",
});

describe("getDuplicatePatientWarning", () => {
  it("stays empty when no patient shares the name", () => {
    expect(
      getDuplicatePatientWarning({
        patientFullName: "Ana Silva",
        duplicatePatientPersonals: [],
        dateFormat: "mm/dd/yyyy",
      }),
    ).toBe("");
  });

  it("stays empty when there is no name yet", () => {
    expect(
      getDuplicatePatientWarning({
        patientFullName: "",
        duplicatePatientPersonals: [patientWithDateOfBirth("1990-03-23")],
        dateFormat: "mm/dd/yyyy",
      }),
    ).toBe("");
  });

  it("names the single match and its date of birth", () => {
    const warning = getDuplicatePatientWarning({
      patientFullName: "  Ana Silva  ",
      duplicatePatientPersonals: [patientWithDateOfBirth("1990-03-23")],
      dateFormat: "mm/dd/yyyy",
    });

    expect(warning).toContain('"Ana Silva"');
    expect(warning).toContain("03/23/1990");
  });

  it("lists every date of birth when several patients share the name", () => {
    const warning = getDuplicatePatientWarning({
      patientFullName: "Ana Silva",
      duplicatePatientPersonals: [
        patientWithDateOfBirth("1988-01-02"),
        patientWithDateOfBirth("1990-03-23"),
        patientWithDateOfBirth("2001-12-31"),
      ],
      dateFormat: "mm/dd/yyyy",
    });

    expect(warning).toContain("3 patients");
    expect(warning).toContain(
      "dates of birth 01/02/1988, 03/23/1990 and 12/31/2001",
    );
  });
});
