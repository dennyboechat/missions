// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";

import { PopupMessageProvider } from "../../../lib/PopupMessage";
import { actionOk } from "../../../types/ActionResult";

const insertPatientGeneralMedication = vi.fn();
const getPatientGeneralMedications = vi.fn();

vi.mock(
  "../../../database/patient-general-medication/GetPatientGeneralMedications",
  () => ({
    getPatientGeneralMedications: () => getPatientGeneralMedications(),
  })
);
vi.mock(
  "../../../database/patient-general-medication/InsertPatientGeneralMedication",
  () => ({
    insertPatientGeneralMedication: (...args: unknown[]) =>
      insertPatientGeneralMedication(...args),
  })
);
vi.mock(
  "../../../database/patient-general-medication/UpdatePatientGeneralMedication",
  () => ({ updatePatientGeneralMedication: vi.fn(async () => actionOk({})) })
);
vi.mock(
  "../../../database/patient-general-medication/DeletePatientGeneralMedication",
  () => ({ deletePatientGeneralMedication: vi.fn(async () => actionOk({})) })
);

const { GeneralAppointmentMedicationPrescribed } = await import(
  "../components/GeneralAppointmentMedicationPrescribed"
);

let insertCount = 0;

beforeEach(() => {
  insertCount = 0;
  getPatientGeneralMedications.mockImplementation(async () => actionOk([]));
  insertPatientGeneralMedication.mockImplementation(async () => {
    insertCount += 1;
    return actionOk({
      patientGeneralPrescribedMedicationId: `uid-${insertCount}`,
    });
  });
});

afterEach(cleanup);

// The unit select carries role="combobox" too, so the drug field is picked out
// by being the input.
const lastDrugInput = () => {
  const inputs = screen
    .getAllByRole("combobox")
    .filter((element) => element.tagName === "INPUT");

  return inputs[inputs.length - 1];
};

const renderPrescribed = () =>
  render(
    <Theme>
      <PopupMessageProvider>
        <GeneralAppointmentMedicationPrescribed patientGeneralId="general-1" />
      </PopupMessageProvider>
    </Theme>
  );

describe("prescribing with typo corrections", () => {
  it("keeps offering corrections round after round", async () => {
    const user = userEvent.setup();
    renderPrescribed();

    await waitFor(() => expect(lastDrugInput()).toBeDefined());

    const rounds = [
      ["Lossrtan", "Losartan"],
      ["Ibuprofin", "Ibuprofen"],
      ["Amoxicilin", "Amoxicillin"],
      ["Warfarn", "Warfarin"],
    ];

    for (const [typed, suggested] of rounds) {
      await user.click(lastDrugInput());
      await user.keyboard(typed);
      await user.tab();

      expect(
        await screen.findByText(`Did you mean ${suggested}?`),
        `round for ${typed}`
      ).toBeDefined();

      await user.click(screen.getByRole("button", { name: `Use ${suggested}` }));

      await waitFor(() =>
        expect(screen.queryByText(`Did you mean ${suggested}?`)).toBeNull()
      );
    }

    expect(insertCount).toBe(rounds.length);
  });

  it("offers a correction on the next row after the dose was filled in", async () => {
    const user = userEvent.setup();
    renderPrescribed();

    await waitFor(() => expect(lastDrugInput()).toBeDefined());

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();
    await user.click(await screen.findByRole("button", { name: "Use Losartan" }));

    // Fill the row out the way a user would before moving on.
    const amounts = screen.getAllByPlaceholderText("500");
    await user.click(amounts[0]);
    await user.keyboard("500");
    await user.tab();

    await user.click(lastDrugInput());
    await user.keyboard("Ibuprofin");
    await user.tab();

    expect(await screen.findByText("Did you mean Ibuprofen?")).toBeDefined();
  });

  it("offers corrections on an appointment that already has medication", async () => {
    getPatientGeneralMedications.mockImplementation(async () =>
      actionOk([
        {
          patientGeneralPrescribedMedicationId: "saved-1",
          drug: "Amoxicillin",
          dose: "500 mg",
          quantity: 21,
          instructions: "Three times a day",
        },
        {
          patientGeneralPrescribedMedicationId: "saved-2",
          drug: "Paracetamol",
          dose: "500 mg",
          quantity: 20,
          instructions: "As needed",
        },
      ])
    );

    const user = userEvent.setup();
    renderPrescribed();

    await waitFor(() =>
      expect(
        screen
          .getAllByRole("combobox")
          .filter((element) => element.tagName === "INPUT")
      ).toHaveLength(3)
    );

    for (const [typed, suggested] of [
      ["Lossrtan", "Losartan"],
      ["Ibuprofin", "Ibuprofen"],
      ["Warfarn", "Warfarin"],
    ]) {
      await user.click(lastDrugInput());
      await user.keyboard(typed);
      await user.tab();

      expect(
        await screen.findByText(`Did you mean ${suggested}?`),
        `round for ${typed}`
      ).toBeDefined();

      await user.click(screen.getByRole("button", { name: `Use ${suggested}` }));

      await waitFor(() =>
        expect(screen.queryByText(`Did you mean ${suggested}?`)).toBeNull()
      );
    }
  });

  it("offers a fresh correction after one was abandoned without answering", async () => {
    const user = userEvent.setup();
    renderPrescribed();

    await waitFor(() => expect(lastDrugInput()).toBeDefined());

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();
    expect(await screen.findByText("Did you mean Losartan?")).toBeDefined();

    // Walk away from the prompt, then retype in the same field.
    await user.click(document.body);
    await user.click(lastDrugInput());
    await user.clear(lastDrugInput());
    await user.keyboard("Ibuprofin");
    await user.tab();

    expect(await screen.findByText("Did you mean Ibuprofen?")).toBeDefined();
  });
});
