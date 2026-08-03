import { describe, it, expect } from "vitest";

import { getPatientRecordUrl } from "../getPatientRecordUrl";

const PATIENT_ID = "3f6b1c7e-0f2a-4c8d-9a11-5c6d7e8f9a0b";

describe("getPatientRecordUrl", () => {
  it("puts the host in front of the record's path", () => {
    expect(
      getPatientRecordUrl({
        origin: "https://missions.example.com",
        patientPersonalId: PATIENT_ID,
      }),
    ).toBe(`https://missions.example.com/patient-summary/${PATIENT_ID}`);
  });

  it("keeps the port, so a code scans on a phone on the same network", () => {
    expect(
      getPatientRecordUrl({
        origin: "http://192.168.1.20:3000",
        patientPersonalId: PATIENT_ID,
      }),
    ).toBe(`http://192.168.1.20:3000/patient-summary/${PATIENT_ID}`);
  });

  it("does not double the slash on an origin that ends with one", () => {
    expect(
      getPatientRecordUrl({
        origin: "https://missions.example.com/",
        patientPersonalId: PATIENT_ID,
      }),
    ).toBe(`https://missions.example.com/patient-summary/${PATIENT_ID}`);
  });

  it("has nothing to say without an origin", () => {
    // The server renders this component too, and it has no idea which host the
    // page was asked for. An empty string is what tells the caller to draw the
    // plate and wait rather than encode a link to nowhere.
    expect(getPatientRecordUrl({ patientPersonalId: PATIENT_ID })).toBe("");
  });

  it("has nothing to say without a patient", () => {
    expect(
      getPatientRecordUrl({ origin: "https://missions.example.com" }),
    ).toBe("");
  });
});
