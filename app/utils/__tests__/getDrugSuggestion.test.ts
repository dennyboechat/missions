import { describe, it, expect } from "vitest";

import { getDrugSuggestion } from "../getDrugSuggestion";
import { getMostCommonDentalDrugs } from "../getMostCommonDentalDrugs";

const drugs = getMostCommonDentalDrugs();

describe("getDrugSuggestion", () => {
  it("has nothing to ask about when the drug is on the list", () => {
    expect(getDrugSuggestion({ drug: "Losartan", drugs })).toBe("");
  });

  it("ignores capitalisation and spacing when deciding a name is known", () => {
    expect(getDrugSuggestion({ drug: "  losartan ", drugs })).toBe("");
  });

  it("has nothing to ask about when there is no drug yet", () => {
    expect(getDrugSuggestion({ drug: "", drugs })).toBe("");
    expect(getDrugSuggestion({ drug: undefined, drugs })).toBe("");
  });

  it("offers the drug a typo was reaching for", () => {
    expect(getDrugSuggestion({ drug: "Lossrtan", drugs })).toBe("Losartan");
    expect(getDrugSuggestion({ drug: "Acetaminophn", drugs })).toBe(
      "Acetaminophen"
    );
    expect(getDrugSuggestion({ drug: "Ibuprofin", drugs })).toBe("Ibuprofen");
  });

  it("stays quiet for a drug the list simply does not carry", () => {
    expect(getDrugSuggestion({ drug: "Praziquantel", drugs })).toBe("");
  });
});
