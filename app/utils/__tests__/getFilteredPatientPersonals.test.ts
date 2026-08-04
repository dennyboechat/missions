import { describe, it, expect } from "vitest";

import { getFilteredPatientPersonals } from "../getFilteredPatientPersonals";

// Types
import { PatientPersonalTypes } from "../../types/PatientPersonalTypes";

const patient = (
  patientFullName: string,
  patientDateOfBirth = "1990-03-04",
  patientPhoneNumber = "",
): PatientPersonalTypes => ({
  patientPersonalId: patientFullName,
  projectId: "project-1",
  patientFullName,
  isPatientMale: true,
  patientDateOfBirth,
  patientPhoneNumber,
});

const names = (patients: PatientPersonalTypes[]) =>
  patients.map((found) => found.patientFullName);

describe("getFilteredPatientPersonals", () => {
  it("gives the whole list back when nothing has been typed", () => {
    const patients = [patient("Ana Costa"), patient("Bruno Lima")];

    expect(getFilteredPatientPersonals({ patientPersonals: patients, dateFormat: "mm/dd/yyyy" }))
      .toEqual(patients);
    expect(getFilteredPatientPersonals({ patientPersonals: patients, filterText: "", dateFormat: "mm/dd/yyyy" }))
      .toEqual(patients);
  });

  it("puts a name that starts with what was typed above one that merely contains it", () => {
    // Someone typing "silva" is far more often looking for Silva Rocha than for
    // Maria da Silva, and either way wants both.
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("Maria da Silva"), patient("Silva Rocha")],
      filterText: "silva",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["Silva Rocha", "Maria da Silva"]);
  });

  it("ranks the name above the phone number for one search", () => {
    // A mission records patients it cannot name by their number, so "0123" is a
    // search that genuinely hits both fields.
    const found = getFilteredPatientPersonals({
      patientPersonals: [
        patient("Ana Costa", "1970-01-01", "555 0123"),
        patient("Ward 0123 unnamed", "1970-01-01", ""),
        patient("0123 unnamed", "1970-01-01", ""),
      ],
      filterText: "0123",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["0123 unnamed", "Ward 0123 unnamed", "Ana Costa"]);
  });

  it("tags each match with the field it matched on, in that order of preference", () => {
    // The ranking the sort reads. Name first, whole or partial, then the date of
    // birth, then the phone number -- the order a clinician searches in.
    const rank = (
      one: ReturnType<typeof patient>,
      filterText: string,
    ) =>
      getFilteredPatientPersonals({
        patientPersonals: [one],
        filterText,
        dateFormat: "mm/dd/yyyy",
      })[0]?.filterOrder;

    expect(rank(patient("Ana Costa"), "ana")).toBe(1);
    expect(rank(patient("Ana Costa"), "costa")).toBe(2);
    expect(rank(patient("Ana Costa", "1990-03-04"), "03/04")).toBe(3);
    expect(rank(patient("Ana Costa", "1990-03-04", "555 0123"), "0123")).toBe(4);
  });

  it("finds nobody when nothing matches", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("Ana Costa")],
      filterText: "zzz",
      dateFormat: "mm/dd/yyyy",
    });

    expect(found).toEqual([]);
  });

  it("finds nobody in an empty list", () => {
    expect(getFilteredPatientPersonals({ patientPersonals: [], filterText: "ana", dateFormat: "mm/dd/yyyy" }))
      .toEqual([]);
  });

  it("ignores the case of what was typed", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("Ana Costa")],
      filterText: "ANA COSTA",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["Ana Costa"]);
  });

  it("finds an accented name from the letters a plain keyboard can type", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("José Ramírez"), patient("Müller")],
      filterText: "jose ram",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["José Ramírez"]);
  });

  it("matches the date of birth as the project writes it, not as it is stored", () => {
    // The same patient, the same day, two projects. Search has to agree with the
    // column the reader is looking at, or typing what is on screen finds nothing.
    const patients = () => [patient("Ana Costa", "1990-03-04")];

    expect(names(getFilteredPatientPersonals({
      patientPersonals: patients(),
      filterText: "03/04",
      dateFormat: "mm/dd/yyyy",
    }))).toEqual(["Ana Costa"]);

    expect(names(getFilteredPatientPersonals({
      patientPersonals: patients(),
      filterText: "04/03",
      dateFormat: "dd/mm/yyyy",
    }))).toEqual(["Ana Costa"]);

    // And does not match the other order, which is a different day.
    expect(getFilteredPatientPersonals({
      patientPersonals: patients(),
      filterText: "04/03",
      dateFormat: "mm/dd/yyyy",
    })).toEqual([]);
  });

  it("finds a patient by the year they were born", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("Ana Costa", "1948-11-02"), patient("Bruno Lima", "1990-03-04")],
      filterText: "1948",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["Ana Costa"]);
  });

  it("finds a patient by part of their phone number", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [
        patient("Ana Costa", "1990-03-04", "+679 555 0123"),
        patient("Bruno Lima", "1990-03-04", "+679 555 7777"),
      ],
      filterText: "0123",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["Ana Costa"]);
  });

  it("counts a patient once even when their name and their phone number both match", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("555", "1990-03-04", "555 0123")],
      filterText: "555",
      dateFormat: "mm/dd/yyyy",
    });

    expect(found.length).toBe(1);
  });

  it("tolerates a patient with no phone number on record", () => {
    const found = getFilteredPatientPersonals({
      patientPersonals: [patient("Ana Costa", "1990-03-04", undefined as never)],
      filterText: "ana",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found)).toEqual(["Ana Costa"]);
  });

  it("does not lose a patient the list already held", () => {
    const patients = [patient("Ana Costa"), patient("Bruno Lima"), patient("Ana Lima")];

    const found = getFilteredPatientPersonals({
      patientPersonals: patients,
      filterText: "ana",
      dateFormat: "mm/dd/yyyy",
    });

    expect(names(found).sort()).toEqual(["Ana Costa", "Ana Lima"]);
    expect(patients.length).toBe(3);
  });
});
