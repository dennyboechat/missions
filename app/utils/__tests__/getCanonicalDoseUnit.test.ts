import { describe, it, expect } from "vitest";

import { getCanonicalDoseUnit } from "../getCanonicalDoseUnit";
import { getDoseUnits } from "../getDoseUnits";

describe("getCanonicalDoseUnit", () => {
  it("collapses the spellings of a unit onto the one that is stored", () => {
    expect(["mcg", "mcgs", "ug", "µg", "microgram", "micrograms"].map(getCanonicalDoseUnit))
      .toEqual(["mcg", "mcg", "mcg", "mcg", "mcg", "mcg"]);

    expect(["mg", "mgs", "milligram", "milligrams"].map(getCanonicalDoseUnit))
      .toEqual(["mg", "mg", "mg", "mg"]);

    expect(["ml", "mls", "cc", "milliliter", "millilitres"].map(getCanonicalDoseUnit))
      .toEqual(["mL", "mL", "mL", "mL", "mL"]);

    expect(["iu", "ius", "unit", "units"].map(getCanonicalDoseUnit))
      .toEqual(["IU", "IU", "IU", "IU"]);

    expect(["meq", "milliequivalent", "milliequivalents"].map(getCanonicalDoseUnit))
      .toEqual(["mEq", "mEq", "mEq"]);

    expect(["%", "pct", "percent"].map(getCanonicalDoseUnit))
      .toEqual(["%", "%", "%"]);
  });

  it("does not read a bare u as IU", () => {
    // "10u" taken as "100" is the classic tenfold insulin error. Recognising
    // nothing here leaves the dose as the free text it was typed as, which a
    // human still reads correctly.
    expect(getCanonicalDoseUnit("u")).toBe("");
    expect(getCanonicalDoseUnit("U")).toBe("");
  });

  it("ignores case, surrounding space and repeated space inside a name", () => {
    expect(getCanonicalDoseUnit("  MG ")).toBe("mg");
    expect(getCanonicalDoseUnit("ML")).toBe("mL");
    expect(getCanonicalDoseUnit("International   Units")).toBe("IU");
  });

  it("recognises nothing in text that is not a unit", () => {
    // The caller reads the empty string as "leave the dose alone", so free text
    // like a schedule never has a unit invented for it.
    expect(getCanonicalDoseUnit("as needed")).toBe("");
    expect(getCanonicalDoseUnit("twice daily")).toBe("");
    expect(getCanonicalDoseUnit("tablet")).toBe("");
    expect(getCanonicalDoseUnit("500")).toBe("");
  });

  it("recognises nothing in nothing", () => {
    expect(getCanonicalDoseUnit()).toBe("");
    expect(getCanonicalDoseUnit("")).toBe("");
    expect(getCanonicalDoseUnit("   ")).toBe("");
  });

  it("keeps every unit the picker offers, so a stored dose survives a re-save", () => {
    for (const unit of getDoseUnits()) {
      expect(getCanonicalDoseUnit(unit)).toBe(unit);
    }
  });

  it("only ever answers with a unit the picker offers", () => {
    const inputs = [
      "mcgs", "ug", "µg", "mgs", "gm", "grams", "cc", "mls", "litres",
      "units", "meqs", "percent", "as needed", "", "u",
    ];

    for (const input of inputs) {
      const canonical = getCanonicalDoseUnit(input);

      if (canonical) {
        expect(getDoseUnits()).toContain(canonical);
      }
    }
  });

  it("settles after one pass", () => {
    for (const input of ["mgs", "cc", "units", "percent", "grams", "as needed"]) {
      const once = getCanonicalDoseUnit(input);

      expect(getCanonicalDoseUnit(once)).toBe(once);
    }
  });

  it("keeps the gram family apart, which a looser prefix match would merge", () => {
    expect(getCanonicalDoseUnit("g")).toBe("g");
    expect(getCanonicalDoseUnit("mg")).toBe("mg");
    expect(getCanonicalDoseUnit("mcg")).toBe("mcg");
    expect(new Set(["g", "mg", "mcg"].map(getCanonicalDoseUnit)).size).toBe(3);
  });
});

describe("getDoseUnits", () => {
  it("lists each unit once", () => {
    const units = getDoseUnits();

    expect(new Set(units).size).toBe(units.length);
  });

  it("hands out a fresh list, so a caller that sorts it does not reorder the picker", () => {
    const first = getDoseUnits();
    first.push("tablespoons");

    expect(getDoseUnits()).not.toContain("tablespoons");
  });

  it("starts at the smallest mass, the order the picker reads in", () => {
    expect(getDoseUnits().slice(0, 3)).toEqual(["mcg", "mg", "g"]);
  });
});
