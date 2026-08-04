import { describe, it, expect } from "vitest";

import { getEditDistance } from "../getEditDistance";

describe("getEditDistance", () => {
  it("costs nothing to leave a string alone", () => {
    expect(getEditDistance("Losartan", "Losartan")).toBe(0);
    expect(getEditDistance("", "")).toBe(0);
  });

  it("charges the whole string against an empty one", () => {
    expect(getEditDistance("", "Losartan")).toBe(8);
    expect(getEditDistance("Losartan", "")).toBe(8);
  });

  it("counts one substitution, one insertion and one deletion as one each", () => {
    // The typo the drug suggestion exists for: two letters transposed reads as a
    // single substitution away from the real name.
    expect(getEditDistance("Lossrtan", "Losartan")).toBe(1);
    expect(getEditDistance("Losartann", "Losartan")).toBe(1);
    expect(getEditDistance("Losartn", "Losartan")).toBe(1);
  });

  it("charges two for a pair of swapped letters, which are two substitutions", () => {
    // Not one: this is Levenshtein, which has no transposition move. A
    // suggestion threshold of 1 will not catch "Loasrtan", and that is the
    // distance it is being measured against.
    expect(getEditDistance("Loasrtan", "Losartan")).toBe(2);
  });

  it("reads the same in either direction", () => {
    const pairs: [string, string][] = [
      ["Amoxicillin", "Amoxicilin"],
      ["Ibuprofen", "Paracetamol"],
      ["Metformin", "Metronidazole"],
      ["", "Aspirin"],
    ];

    for (const [text, otherText] of pairs) {
      expect(getEditDistance(text, otherText)).toBe(
        getEditDistance(otherText, text)
      );
    }
  });

  it("never charges more than rewriting the longer string outright", () => {
    const words = ["Losartan", "Aspirin", "", "a", "Sulfamethoxazole"];

    for (const text of words) {
      for (const otherText of words) {
        expect(getEditDistance(text, otherText)).toBeLessThanOrEqual(
          Math.max(text.length, otherText.length)
        );
      }
    }
  });

  it("obeys the triangle inequality, which is what makes a nearest match mean anything", () => {
    const a = "Losartan";
    const b = "Lisinopril";
    const c = "Losartann";

    expect(getEditDistance(a, b)).toBeLessThanOrEqual(
      getEditDistance(a, c) + getEditDistance(c, b)
    );
  });

  it("treats a difference in case as a difference", () => {
    // Callers normalise before measuring; this is why they have to.
    expect(getEditDistance("losartan", "Losartan")).toBe(1);
  });

  it("measures by character, so an accent is one edit and not a whole word", () => {
    expect(getEditDistance("José", "Jose")).toBe(1);
  });

  it("gives the same answer whichever string is the longer one, over the shorter row", () => {
    // The implementation keeps two rows of the matrix live and walks the first
    // argument's length. A wrong loop bound shows up as an asymmetry between a
    // long-against-short call and its reverse.
    expect(getEditDistance("a", "abcdefghij")).toBe(9);
    expect(getEditDistance("abcdefghij", "a")).toBe(9);
  });
});
