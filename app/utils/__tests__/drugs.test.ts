import { describe, it, expect } from "vitest";

import {
  DRUGS,
  DRUG_ALIASES,
  getDrugOptions,
  resolveDrugName,
} from "../drugs";

describe("the canonical list", () => {
  // The whole reason aliases exist: the medication report groups by the stored
  // name, so a molecule listed twice is a molecule reported twice. Paracetamol
  // and Acetaminophen were both on the list and split 58 prescriptions.
  it("holds each molecule once", () => {
    const names = DRUGS.map((drug) => drug.toLowerCase());

    expect(new Set(names).size).toBe(names.length);
  });

  it("does not list a synonym as a drug of its own", () => {
    for (const alias of Object.keys(DRUG_ALIASES)) {
      expect(DRUGS).not.toContain(alias);
    }
  });

  // A combination written both ways round is the same duplicate wearing a
  // disguise -- Sulfamethoxazole/Trimethoprim was on the list twice like this.
  it("does not list a combination in both orders", () => {
    const seen = new Map<string, string>();

    for (const drug of DRUGS.filter((name) => name.includes("/"))) {
      const key = drug
        .split("/")
        .map((part) => part.trim().toLowerCase())
        .sort()
        .join("+");

      expect(seen.get(key)).toBeUndefined();
      seen.set(key, drug);
    }
  });

  it("points every alias at a drug that is actually on the list", () => {
    for (const canonical of Object.values(DRUG_ALIASES)) {
      expect(DRUGS).toContain(canonical);
    }
  });
});

describe("resolving what was typed", () => {
  it("takes a canonical name as it is", () => {
    expect(resolveDrugName("Amoxicillin")).toBe("Amoxicillin");
  });

  it("ignores case and surrounding space", () => {
    // Both were real rows: "Metformin " sat beside "Metformin", and "metformin"
    // beside both.
    expect(resolveDrugName("  metformin ")).toBe("Metformin");
    expect(resolveDrugName("IBUPROFEN")).toBe("Ibuprofen");
  });

  // The names that were being typed into this database as free text.
  it("resolves the brands people actually typed", () => {
    expect(resolveDrugName("Tylenol")).toBe("Paracetamol");
    expect(resolveDrugName("Acetaminophen")).toBe("Paracetamol");
    expect(resolveDrugName("Flagyl")).toBe("Metronidazole");
    expect(resolveDrugName("Dipirona")).toBe("Metamizole");
  });

  it("resolves the same molecule named on the other side of the Atlantic", () => {
    expect(resolveDrugName("Albuterol")).toBe("Salbutamol");
    expect(resolveDrugName("Acetylsalicylic Acid")).toBe("Aspirin");
    expect(resolveDrugName("Trimethoprim/Sulfamethoxazole")).toBe(
      "Sulfamethoxazole/Trimethoprim"
    );
  });

  // Not a rejection. A mission carries drugs neither list has heard of, and the
  // caller keeps the typed name when this returns nothing.
  it("returns nothing for a name it does not know", () => {
    expect(resolveDrugName("Fictionamycin")).toBeUndefined();
    expect(resolveDrugName("")).toBeUndefined();
    expect(resolveDrugName()).toBeUndefined();
  });
});

describe("what the field offers", () => {
  it("offers the canonical drugs and the aliases together", () => {
    const names = getDrugOptions().map(({ name }) => name);

    // Both, so typing "Tyl" finds something rather than nothing.
    expect(names).toContain("Paracetamol");
    expect(names).toContain("Tylenol");
    expect(names.length).toBe(DRUGS.length + Object.keys(DRUG_ALIASES).length);
  });

  // Rebuilding the array per call invalidates the memo that decides which drugs
  // the autocomplete shows, so the near-match search reruns on every keystroke.
  it("returns the same array every time", () => {
    expect(getDrugOptions()).toBe(getDrugOptions());
  });

  it("is sorted, so the list reads alphabetically", () => {
    const names = getDrugOptions().map(({ name }) => name);

    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe("what a mission clinic needs on the list", () => {
  // Each of these was typed by hand into this database because it was missing.
  it("has the drugs that were being typed as free text", () => {
    for (const drug of [
      "Metformin",
      "Loratadine",
      "Aspirin",
      "Cephalexin",
      "Hydroxyzine",
      "Calcium Carbonate",
      "Multivitamin",
      "Metamizole",
    ]) {
      expect(DRUGS).toContain(drug);
    }
  });

  // First-line for primary care and dentistry where these missions run.
  it("has the first-line agents for the setting", () => {
    for (const drug of [
      "Salbutamol",
      "Ferrous Sulfate",
      "Oral Rehydration Salts",
      "Artemether/Lumefantrine",
      "Mebendazole",
      "Articaine",
      "Chlorhexidine",
    ]) {
      expect(DRUGS).toContain(drug);
    }
  });

  // The list carried 444 entries including CAR-T therapy and withdrawn COVID
  // antibodies, all of which the near-match search competed against.
  it("no longer carries what a field clinic cannot dispense", () => {
    for (const drug of [
      "Brexucabtagene Autoleucel",
      "Bamlanivimab",
      "Casirivimab/Imdevimab",
      "Blinatumomab",
      "Propofol",
      "Succinylcholine",
      "Coagulation Factor VIIa",
    ]) {
      expect(DRUGS).not.toContain(drug);
    }
  });

  // Kept, because a mission clinic does dispense them -- pruning is by what is
  // carried, not by how specialised a drug sounds.
  it("keeps the everyday drugs", () => {
    for (const drug of [
      "Amoxicillin",
      "Metronidazole",
      "Clindamycin",
      "Ibuprofen",
      "Paracetamol",
      "Lidocaine",
      "Omeprazole",
      "Losartan",
      "Ivermectin",
      "Fluconazole",
      "Clotrimazole",
    ]) {
      expect(DRUGS).toContain(drug);
    }
  });
});
