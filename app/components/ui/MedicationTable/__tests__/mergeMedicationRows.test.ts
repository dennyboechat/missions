import { describe, it, expect } from "vitest";

import {
  mergeMedicationRows,
  toMedicationRows,
} from "../utils/mergeMedicationRows";

// Types
import { Medication } from "../../../../types/Medication";
import { PrescribedMedication } from "../types/PrescribedMedication";

const record = (
  medicationUid: string,
  overrides: Partial<PrescribedMedication> = {},
): PrescribedMedication => ({
  medicationUid,
  drug: "Ibuprofen",
  dose: "400",
  quantity: 20,
  instructions: "Twice a day",
  ...overrides,
});

const saved = (medicationUid: string, rowId: string): Medication => ({
  rowId,
  medicationUid,
  drug: "Ibuprofen",
  dose: "400",
  quantity: 20,
  instructions: "Twice a day",
});

const blank = (rowId = "blank-row"): Medication => ({
  rowId,
  drug: undefined,
  dose: "",
  quantity: undefined,
  instructions: "",
});

const rowIds = (rows: Medication[]) => rows.map(({ rowId }) => rowId);

describe("toMedicationRows", () => {
  it("builds a row per prescription plus the blank one", () => {
    const rows = toMedicationRows([record("a"), record("b")]);

    expect(rows).toHaveLength(3);
    expect(rows[2].medicationUid).toBeUndefined();
  });

  it("gives a table with nothing prescribed a row to prescribe into", () => {
    expect(toMedicationRows([])).toHaveLength(1);
  });
});

describe("mergeMedicationRows", () => {
  it("keeps the identity of a row the database agrees with", () => {
    const current = [saved("a", "row-a"), blank()];

    const rows = mergeMedicationRows({ current, incoming: [record("a")] });

    // The key is what holds the cursor and the selection in an uncontrolled
    // input. An unchanged row must not be rebuilt.
    expect(rowIds(rows)).toEqual(["row-a", "blank-row"]);
    expect(rows[0]).toBe(current[0]);
  });

  it("replaces a row somebody else changed, so the inputs re-read it", () => {
    const current = [saved("a", "row-a"), blank()];

    const rows = mergeMedicationRows({
      current,
      incoming: [record("a", { quantity: 30 })],
    });

    // A new key is the only thing that makes an uncontrolled input show a value
    // it was not mounted with.
    expect(rows[0].rowId).not.toBe("row-a");
    expect(rows[0].quantity).toBe(30);
    expect(rows[0].medicationUid).toBe("a");
  });

  it("does not call null, empty and undefined a change", () => {
    const current: Medication[] = [
      { rowId: "row-a", medicationUid: "a", drug: "Ibuprofen", dose: "" },
      blank(),
    ];

    const rows = mergeMedicationRows({
      current,
      incoming: [
        {
          medicationUid: "a",
          drug: "Ibuprofen",
          dose: undefined,
          quantity: undefined,
          instructions: undefined,
        },
      ],
    });

    // Otherwise every refresh would rebuild every partly-filled row, which is
    // most of them.
    expect(rowIds(rows)).toEqual(["row-a", "blank-row"]);
  });

  it("brings in a prescription somebody else added", () => {
    const rows = mergeMedicationRows({
      current: [saved("a", "row-a"), blank()],
      incoming: [record("a"), record("b", { drug: "Metformin" })],
    });

    expect(rows).toHaveLength(3);
    expect(rows[1].drug).toBe("Metformin");
    // The blank row stays where it belongs: at the bottom.
    expect(rows[2].medicationUid).toBeUndefined();
  });

  it("removes a prescription somebody else deleted", () => {
    const rows = mergeMedicationRows({
      current: [saved("a", "row-a"), saved("b", "row-b"), blank()],
      incoming: [record("b")],
    });

    expect(rowIds(rows)).toEqual(["row-b", "blank-row"]);
  });

  it("carries across a row whose insert has not answered yet", () => {
    // Choosing a drug fills the blank row in and leaves it without an id until
    // the insert returns. A refresh must not take it away.
    const inFlight: Medication = {
      rowId: "row-new",
      drug: "Loratadine",
      dose: "",
      instructions: "",
    };

    const rows = mergeMedicationRows({
      current: [saved("a", "row-a"), inFlight],
      incoming: [record("a")],
    });

    expect(rowIds(rows)).toEqual(["row-a", "row-new"]);
    expect(rows[1]).toBe(inFlight);
  });

  it("always leaves exactly one way to prescribe something new", () => {
    // Every merge has to end with a row that has no id, whether it kept one or
    // had to add it.
    const withBlank = mergeMedicationRows({
      current: [saved("a", "row-a"), blank()],
      incoming: [record("a")],
    });

    const withoutBlank = mergeMedicationRows({
      current: [saved("a", "row-a")],
      incoming: [record("a")],
    });

    expect(
      withBlank.filter(({ medicationUid }) => !medicationUid),
    ).toHaveLength(1);
    expect(
      withoutBlank.filter(({ medicationUid }) => !medicationUid),
    ).toHaveLength(1);
  });

  it("orders saved rows the way the database did", () => {
    const rows = mergeMedicationRows({
      current: [saved("b", "row-b"), saved("a", "row-a"), blank()],
      incoming: [record("a"), record("b")],
    });

    expect(rowIds(rows)).toEqual(["row-a", "row-b", "blank-row"]);
  });
});
