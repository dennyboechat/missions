import { describe, it, expect } from "vitest";

import { parseDose } from "../parseDose";

describe("parseDose", () => {
  it("has nothing to split when there is no dose", () => {
    expect(parseDose(undefined)).toEqual({ amount: "", unit: "" });
    expect(parseDose("   ")).toEqual({ amount: "", unit: "" });
  });

  it("splits the spellings that used to become separate medications", () => {
    const split = { amount: "500", unit: "mg" };

    expect(parseDose("500mg")).toEqual(split);
    expect(parseDose("500 mg")).toEqual(split);
    expect(parseDose("500  MG")).toEqual(split);
    expect(parseDose(" 500mgs ")).toEqual(split);
    expect(parseDose("500 milligrams")).toEqual(split);
  });

  it("reads a number on its own as an amount with no unit yet", () => {
    expect(parseDose("500")).toEqual({ amount: "500", unit: "" });
  });

  it("settles on one decimal separator", () => {
    expect(parseDose("0,5 mL")).toEqual({ amount: "0.5", unit: "mL" });
    expect(parseDose("0.5 ml")).toEqual({ amount: "0.5", unit: "mL" });
  });

  it("keeps free text whole rather than inventing a unit for it", () => {
    expect(parseDose("as needed")).toEqual({ amount: "as needed", unit: "" });
    expect(parseDose("2 tablets with food")).toEqual({
      amount: "2 tablets with food",
      unit: "",
    });
  });

  it("reads a percentage", () => {
    expect(parseDose("2%")).toEqual({ amount: "2", unit: "%" });
  });
});
