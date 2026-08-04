// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";

// Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";

// No settings loaded, so dates read in the shipped default order.
vi.mock("../../../lib/ProjectContext", () => ({
  useProject: () => ({ project: undefined, setProject: vi.fn() }),
}));

const { PatientLabel } = await import("../components/PatientLabel");
const { PatientLabelDialog } = await import("../components/PatientLabelDialog");

const PATIENT_ID = "3f6b1c7e-0f2a-4c8d-9a11-5c6d7e8f9a0b";

const patient = (
  overrides: Partial<PatientPersonalSummary> = {},
): PatientPersonalSummary => ({
  patientPersonalId: PATIENT_ID,
  projectId: "97d4345a-8c2f-4793-89c5-196982f39aa7",
  patientFullName: "Joana Pires",
  patientDateOfBirth: "1983-10-10",
  isPatientMale: false,
  patientPhoneNumber: "0224316",
  ...overrides,
});

const renderLabel = (props: Parameters<typeof PatientLabel>[0]) =>
  render(
    <Theme>
      <PatientLabel {...props} />
    </Theme>,
  );

afterEach(cleanup);

describe("the card", () => {
  it("carries what someone would otherwise have to ask for", () => {
    renderLabel({ patientPersonalId: PATIENT_ID, patient: patient() });

    expect(screen.getByText("Joana Pires")).toBeTruthy();
    expect(screen.getByText("10/10/1983")).toBeTruthy();
    expect(screen.getByText("Female")).toBeTruthy();
    expect(screen.getByText("0224316")).toBeTruthy();
  });

  // The card is kept. An age printed on it is right on the day it leaves the
  // clinic and wrong for every month after, while reading as authoritative
  // because it is printed -- so the date of birth goes on it and the age does
  // not, which is the one place in the product the two are separated.
  it("prints the date of birth and not the age", () => {
    renderLabel({ patientPersonalId: PATIENT_ID, patient: patient() });

    expect(screen.getByText("10/10/1983")).toBeTruthy();
    expect(screen.queryByText(/years old/)).toBeNull();
    expect(screen.queryByText(/yo\b/)).toBeNull();
  });

  it("names the mission the record lives on", () => {
    renderLabel({
      patientPersonalId: PATIENT_ID,
      patient: patient(),
      projectName: "Ambovombe",
    });

    expect(screen.getByText("Ambovombe")).toBeTruthy();
  });

  // A patient with no phone number recorded is a patient with no phone number,
  // which the column allows. A row with nothing after it says less than no row.
  it("leaves out a field the record does not have", () => {
    renderLabel({
      patientPersonalId: PATIENT_ID,
      patient: patient({ patientPhoneNumber: "", patientDateOfBirth: "" }),
    });

    expect(screen.queryByText("Phone")).toBeNull();
    expect(screen.queryByText("Born")).toBeNull();
    expect(screen.getByText("Sex")).toBeTruthy();
  });

  it("puts the record's link on the code, so a scan opens this patient", () => {
    renderLabel({ patientPersonalId: PATIENT_ID, patient: patient() });

    expect(
      screen.getByTitle("QR code opening the record for Joana Pires"),
    ).toBeTruthy();
  });
});

describe("opening the card", () => {
  const renderDialog = (patientData?: PatientPersonalSummary) =>
    render(
      <Theme>
        <PatientLabelDialog
          patientPersonalId={PATIENT_ID}
          patient={patientData}
        >
          <span>{"code"}</span>
        </PatientLabelDialog>
      </Theme>,
    );

  it("opens from the code in the sidebar", async () => {
    const user = userEvent.setup();

    renderDialog(patient());
    await user.click(
      screen.getByRole("button", {
        name: "Show the printable card for Joana Pires",
      }),
    );

    expect(await screen.findByText("Patient card")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Print/ })).toBeTruthy();
  });

  // The code is drawn from the id in the URL, which is there on the first paint;
  // the card is the record, which is not. Opening it in between would show a
  // card with the name and every field on it blank.
  it("waits for the record before it can be opened", () => {
    renderDialog(undefined);

    expect(
      screen.getByRole("button", { name: "Show this patient's printable card" }),
    ).toHaveProperty("disabled", true);
  });
});
