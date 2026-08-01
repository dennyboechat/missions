import { describe, it, expect } from "vitest";

import { formatDose } from "../formatDose";
import { parseDose } from "../parseDose";

describe("formatDose", () => {
  it("joins the amount and the unit the one way", () => {
    expect(formatDose({ amount: "500", unit: "mg" })).toBe("500 mg");
  });

  it("writes a percentage against the number", () => {
    expect(formatDose({ amount: "2", unit: "%" })).toBe("2%");
  });

  it("keeps an amount that has no unit", () => {
    expect(formatDose({ amount: "500", unit: "" })).toBe("500");
  });

  it("treats a unit on its own as no dose at all", () => {
    expect(formatDose({ amount: "", unit: "mg" })).toBe("");
    expect(formatDose({})).toBe("");
  });

  it("collapses every spelling of one dose onto the same stored value", () => {
    const stored = ["500mg", "500 mg", "500  MG", "500mgs"].map((dose) =>
      formatDose(parseDose(dose))
    );

    expect(new Set(stored)).toEqual(new Set(["500 mg"]));
  });

  it("gives free text back unchanged, so nothing is lost on a rewrite", () => {
    expect(formatDose(parseDose("as needed"))).toBe("as needed");
  });
});
