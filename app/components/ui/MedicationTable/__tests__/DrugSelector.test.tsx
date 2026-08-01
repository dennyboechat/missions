// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Theme } from "@radix-ui/themes";

import { MedicationTable } from "../components/MedicationTable";
import { getNewMedicationRecord } from "../utils/getNewMedicationRecord";
import { Medication } from "../../../../types/Medication";
import { actionOk } from "../../../../types/ActionResult";

afterEach(cleanup);

/**
 * Stands in for the appointment components. Its insertMedication mirrors
 * theirs: fill in the trailing empty row, which the selector then follows with
 * a fresh one.
 */
const MedicationTableHarness = () => {
  const [medications, setMedications] = useState<Medication[]>([
    getNewMedicationRecord(),
  ]);

  const insertMedication = async (
    drug: string,
    updatedMedications: Medication[]
  ) => {
    const lastIndex = updatedMedications.length - 1;
    updatedMedications[lastIndex] = {
      ...updatedMedications[lastIndex],
      drug,
      medicationUid: `uid-${drug}`,
    };
  };

  return (
    <Theme>
      <MedicationTable
        medications={medications}
        setMedications={setMedications}
        insertMedication={insertMedication}
        updateMedication={vi.fn(async () => actionOk({}) as never)}
        deleteMedication={vi.fn(async () => actionOk({}) as never)}
      />
    </Theme>
  );
};

// The unit select carries role="combobox" too, so the drug field is picked out
// by being the input.
const lastDrugInput = () => {
  const inputs = screen
    .getAllByRole("combobox")
    .filter((element) => element.tagName === "INPUT");

  return inputs[inputs.length - 1];
};

describe("DrugSelector suggestions", () => {
  it("offers the correction again on the row after one was accepted", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    // First typo: prompt, accept it.
    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();

    expect(await screen.findByText("Did you mean Losartan?")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Use Losartan" }));

    await waitFor(() =>
      expect(screen.queryByText("Did you mean Losartan?")).toBeNull()
    );

    // Second typo, on the row that was just appended.
    await user.click(lastDrugInput());
    await user.keyboard("Ibuprofin");
    await user.tab();

    expect(await screen.findByText("Did you mean Ibuprofen?")).toBeDefined();
  });

  it("offers the correction when the field is left by clicking away", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.click(document.body);

    expect(await screen.findByText("Did you mean Losartan?")).toBeDefined();
  });

  it("offers the correction when the drug is confirmed with Enter", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan{Enter}");

    expect(await screen.findByText("Did you mean Losartan?")).toBeDefined();
  });

  it("keeps offering corrections round after round", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

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
  });

  it("keeps offering corrections round after round when confirmed with Enter", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    const rounds = [
      ["Lossrtan", "Losartan"],
      ["Ibuprofin", "Ibuprofen"],
      ["Amoxicilin", "Amoxicillin"],
      ["Warfarn", "Warfarin"],
    ];

    for (const [typed, suggested] of rounds) {
      await user.click(lastDrugInput());
      await user.keyboard(`${typed}{Enter}`);

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

  it("commits the highlighted drug, not the typed text, on Enter", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Losart{ArrowDown}{Enter}");

    // Committed rows go read-only, so the drug landed as the list spells it.
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("combobox")
          .filter((element) => element.tagName === "INPUT")
          .map((element) => (element as HTMLInputElement).value)
      ).toContain("Losartan")
    );

    expect(screen.queryByText(/Did you mean/)).toBeNull();
  });

  it("offers the correction again after one was kept as typed", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();

    await user.click(await screen.findByRole("button", { name: 'Keep "Lossrtan"' }));

    await user.click(lastDrugInput());
    await user.keyboard("Ibuprofin");
    await user.tab();

    expect(await screen.findByText("Did you mean Ibuprofen?")).toBeDefined();
  });
});

describe("focus after answering the prompt", () => {
  const amountOfRow = (index: number) =>
    screen.getAllByPlaceholderText("500")[index];

  it("moves to the amount field when the correction is used", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();

    await user.click(await screen.findByRole("button", { name: "Use Losartan" }));

    expect(document.activeElement).toBe(amountOfRow(0));
    expect((amountOfRow(0) as HTMLInputElement).readOnly).toBe(false);
  });

  it("moves to the amount field when the typed name is kept", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();

    await user.click(
      await screen.findByRole("button", { name: 'Keep "Lossrtan"' })
    );

    expect(document.activeElement).toBe(amountOfRow(0));
  });

  it("lands on the amount field of the row that was answered", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();
    await user.click(await screen.findByRole("button", { name: "Use Losartan" }));

    await user.click(lastDrugInput());
    await user.keyboard("Ibuprofin");
    await user.tab();
    await user.click(
      await screen.findByRole("button", { name: "Use Ibuprofen" })
    );

    // The second row's amount, not the first one's.
    expect(document.activeElement).toBe(amountOfRow(1));
  });

  it("moves to the amount field when a known drug is confirmed with Enter", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Losartan{Enter}");

    await waitFor(() => expect(document.activeElement).toBe(amountOfRow(0)));
    expect((amountOfRow(0) as HTMLInputElement).readOnly).toBe(false);
  });

  it("moves to the amount field when an option is picked from the list", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Losart");
    await user.click(await screen.findByRole("option", { name: "Losartan" }));

    await waitFor(() => expect(document.activeElement).toBe(amountOfRow(0)));
  });

  it("moves to the amount field when an option is picked with the keyboard", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Losart{ArrowDown}{Enter}");

    await waitFor(() => expect(document.activeElement).toBe(amountOfRow(0)));
  });

  it("adds the row only once when confirming", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Losartan{Enter}");

    await waitFor(() => expect(document.activeElement).toBe(amountOfRow(0)));

    // The committed row plus one trailing empty row, nothing doubled up.
    expect(
      screen
        .getAllByRole("combobox")
        .filter((element) => element.tagName === "INPUT")
    ).toHaveLength(2);
  });

  it("leaves focus alone when the drug commits without a prompt", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Losartan");

    // Clicking off to somewhere else entirely must not drag the caret back.
    await user.click(document.body);

    await waitFor(() =>
      expect((lastDrugInput() as HTMLInputElement).value).toBe("")
    );
    expect(document.activeElement).not.toBe(amountOfRow(0));
  });
});

describe("suggestion visibility", () => {
  it("does not reopen the options list over the pending suggestion", async () => {
    const user = userEvent.setup();
    render(<MedicationTableHarness />);

    await user.click(lastDrugInput());
    await user.keyboard("Lossrtan");
    await user.tab();

    expect(await screen.findByText("Did you mean Losartan?")).toBeDefined();

    // Coming back to the field must not bury the prompt under the dropdown,
    // which is absolutely positioned over exactly that space.
    await user.click(lastDrugInput());

    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
