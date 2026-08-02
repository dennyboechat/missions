import { describe, it, expect } from "vitest";

import { getPagePresenceTarget } from "../getPagePresenceTarget";
import { getInitials } from "../getInitials";

const PATIENT_ID = "6f1b7a2c-6c6a-4c4e-9d3f-2a1b0c9d8e7f";
const PROJECT_ID = "11111111-2222-3333-4444-555555555555";

describe("getPagePresenceTarget", () => {
  it("puts every tab of one patient in the same room", () => {
    const tabs = [
      "patient-summary",
      "patient-general",
      "patient-dentistry",
      "patient-personal",
    ];

    const keys = tabs.map(
      (tab) => getPagePresenceTarget(`/${tab}/${PATIENT_ID}`)?.resourceKey,
    );

    // Someone editing the name on Personal is worth seeing from General: it is
    // one record and one patient.
    expect(new Set(keys)).toEqual(new Set([`patient:${PATIENT_ID}`]));
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

  it("treats the patients list as its own room, scoped by project", () => {
    const target = getPagePresenceTarget(`/project-patients/${PROJECT_ID}`);

    expect(target?.resourceKey).toBe(`project-patients:${PROJECT_ID}`);
    expect(target?.resourceLabel).toBe("Patients");
    expect(target?.scope).toEqual({ projectId: PROJECT_ID });
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
