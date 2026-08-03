import { describe, it, expect } from "vitest";

import { getSideMenuSubHeader } from "../getSideMenuSubHeader";

describe("getSideMenuSubHeader", () => {
  // The bug it exists to prevent: a patient still loading has no date of birth
  // yet, and the line read " (yo)" -- units with nothing to measure.
  it("says nothing while there is no date of birth", () => {
    expect(getSideMenuSubHeader({ dateFormat: "mm/dd/yyyy" })).toBe("");
    expect(
      getSideMenuSubHeader({
        patientDateOfBirth: undefined,
        dateFormat: "mm/dd/yyyy",
      }),
    ).toBe("");
    expect(
      getSideMenuSubHeader({
        patientDateOfBirth: "",
        dateFormat: "mm/dd/yyyy",
      }),
    ).toBe("");
  });

  // Not only the loading state: patient_date_of_birth is nullable, so a patient
  // registered without one would have carried "(yo)" permanently.
  it("never emits an empty age", () => {
    for (const patientDateOfBirth of [
      undefined,
      "",
      "not-a-date",
      "0000-00-00",
    ]) {
      expect(
        getSideMenuSubHeader({ patientDateOfBirth, dateFormat: "mm/dd/yyyy" }),
      ).not.toContain("yo)");
    }
  });

  it("gives the date and the age once both are known", () => {
    const subHeader = getSideMenuSubHeader({
      patientDateOfBirth: "2001-12-22",
      dateFormat: "mm/dd/yyyy",
    });

    expect(subHeader).toMatch(/2001/);
    expect(subHeader).toMatch(/\(\d+yo\)/);
  });

  // A date it cannot turn into an age is still worth showing -- the
  // parenthetical is what gets dropped, not the line.
  it("keeps the date when the age cannot be worked out", () => {
    const subHeader = getSideMenuSubHeader({
      patientDateOfBirth: "not-a-date",
      dateFormat: "mm/dd/yyyy",
    });

    expect(subHeader).not.toBe("");
    expect(subHeader).not.toMatch(/\(/);
  });
});
