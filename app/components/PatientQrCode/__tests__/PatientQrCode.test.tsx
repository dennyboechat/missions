// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";

import { PatientQrCode } from "../components/PatientQrCode";

const PATIENT_ID = "3f6b1c7e-0f2a-4c8d-9a11-5c6d7e8f9a0b";

const renderQrCode = (patientPersonalId: string, patientFullName?: string) =>
  render(
    <Theme>
      <PatientQrCode
        patientPersonalId={patientPersonalId}
        patientFullName={patientFullName}
      />
    </Theme>,
  );

afterEach(cleanup);

describe("PatientQrCode", () => {
  it("draws a code once the browser has told it the host", () => {
    renderQrCode(PATIENT_ID);

    // What it encodes is getPatientRecordUrl's business, and tested there -- a
    // rendered code gives nothing back but path data. What matters here is that
    // the plate does not stay empty on a page that has an origin.
    expect(screen.getByRole("img")).toBeTruthy();
  });

  it("names the patient on the code", () => {
    renderQrCode(PATIENT_ID, "Maria Silva");

    // Someone scanning is about to open a record; the title is what says whose,
    // both to a screen reader and on hover.
    expect(
      screen.getByTitle("QR code opening the record for Maria Silva"),
    ).toBeTruthy();
  });

  it("shows nothing without a patient", () => {
    // The layout renders on every patient route, including the moment a URL is
    // half-typed. A code for no patient would scan to a broken page.
    renderQrCode("");

    expect(screen.queryByRole("img")).toBeNull();
  });
});
