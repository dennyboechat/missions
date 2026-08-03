import { describe, it, expect } from "vitest";

import { getPagePresenceTarget } from "../getPagePresenceTarget";
import { getInitials } from "../getInitials";

const PATIENT_ID = "6f1b7a2c-6c6a-4c4e-9d3f-2a1b0c9d8e7f";
const PROJECT_ID = "11111111-2222-3333-4444-555555555555";

describe("getPagePresenceTarget", () => {
  it("gives each editable tab its own room", () => {
    const tabs = ["patient-general", "patient-dentistry", "patient-personal"];

    const keys = tabs.map(
      (tab) => getPagePresenceTarget(`/${tab}/${PATIENT_ID}`)?.resourceKey,
    );

    // Three tabs, three keys. They used to share one, which left a colleague who
    // had moved to General still listed on Summary -- true to the record, and
    // read by everyone as a stuck roster.
    expect(keys).toEqual([
      `patient-general:${PATIENT_ID}`,
      `patient-dentistry:${PATIENT_ID}`,
      `patient-personal:${PATIENT_ID}`,
    ]);
    expect(new Set(keys).size).toBe(tabs.length);
  });

  it("stays off Summary, which nobody edits", () => {
    // The record read back. Two people looking at it cannot overwrite each
    // other, so there is nothing for a roster to warn about.
    expect(getPagePresenceTarget(`/patient-summary/${PATIENT_ID}`)).toBeUndefined();
  });

  it("keeps one room per patient per tab, not one per visit", () => {
    // The key is derived, not generated: two people on the same tab of the same
    // patient have to land in the same room or they never see each other.
    expect(getPagePresenceTarget(`/patient-general/${PATIENT_ID}`)?.resourceKey).toBe(
      getPagePresenceTarget(`/patient-general/${PATIENT_ID}`)?.resourceKey,
    );
  });

  it("names which tab each person is on", () => {
    expect(
      getPagePresenceTarget(`/patient-dentistry/${PATIENT_ID}`)?.resourceLabel,
    ).toBe("Dental");

    expect(
      getPagePresenceTarget(`/patient-general/${PATIENT_ID}`)?.resourceLabel,
    ).toBe("General");
  });

  it("scopes a patient page by the patient, so the roster is authorised", () => {
    expect(getPagePresenceTarget(`/patient-general/${PATIENT_ID}`)?.scope).toEqual(
      { patientPersonalId: PATIENT_ID },
    );
  });

  it("stays off the patients list", () => {
    // A list, not a form: nothing on it is edited in place, so it carries no
    // roster and writes no heartbeat.
    expect(getPagePresenceTarget(`/project-patients/${PROJECT_ID}`)).toBeUndefined();
  });

  it("stays out of screens nobody shares", () => {
    // No heartbeat means no write, so the quiet screens cost nothing.
    expect(getPagePresenceTarget("/dashboard")).toBeUndefined();
    expect(getPagePresenceTarget("/sign-in")).toBeUndefined();
    expect(getPagePresenceTarget("/")).toBeUndefined();
    expect(getPagePresenceTarget("/project-reports")).toBeUndefined();
  });

  it("ignores a patient route with no patient on it", () => {
    expect(getPagePresenceTarget("/patient-general/")).toBeUndefined();
  });
});

describe("getInitials", () => {
  it("takes the first and last word, not the first two", () => {
    expect(getInitials("Maria da Silva")).toBe("MS");
  });

  it("handles a single name", () => {
    expect(getInitials("Denny")).toBe("D");
  });

  it("survives a name that is only punctuation", () => {
    expect(getInitials("--")).toBe("");
    expect(getInitials("")).toBe("");
    expect(getInitials(undefined)).toBe("");
  });

  it("keeps accented letters rather than dropping them", () => {
    expect(getInitials("Ângela Óscar")).toBe("ÂÓ");
  });
});
