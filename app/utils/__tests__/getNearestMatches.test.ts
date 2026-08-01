import { describe, it, expect } from "vitest";

import { getNearestMatches } from "../getNearestMatches";

const items = [
  { name: "Losartan" },
  { name: "Lurasidone" },
  { name: "Amoxicillin" },
  { name: "Amoxicillin/Clavulanate" },
  { name: "Warfarin" },
];

const namesOf = (query: string, limit?: number) =>
  getNearestMatches({ query, items, limit }).map(({ name }) => name);

describe("getNearestMatches", () => {
  it("reaches the name a typo was aiming at", () => {
    expect(namesOf("Lossrtan")).toContain("Losartan");
  });

  it("puts the closest name first", () => {
    expect(namesOf("Lossrtan")[0]).toBe("Losartan");
  });

  it("reaches a long name through a near-miss on its opening", () => {
    expect(namesOf("Amoxicilin")).toContain("Amoxicillin/Clavulanate");
  });

  it("finds nothing for a name that is nowhere near the list", () => {
    expect(namesOf("Praziquantel")).toEqual([]);
  });

  it("ignores queries too short to tell a slip from a different word", () => {
    expect(namesOf("Lo")).toEqual([]);
  });

  it("returns no more than the limit", () => {
    expect(namesOf("Losartan", 1)).toHaveLength(1);
  });
});
