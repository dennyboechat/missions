import { describe, it, expect } from "vitest";

import { getBodyMassIndex } from "../getBodyMassIndex";

/**
 * Weight in kilograms, height in centimetres -- the units every record is
 * stored in, whatever the project displays. A project set to inches and pounds
 * converts at the edges, so this never sees anything else; passing 5'9" as 69
 * would read as a 69cm patient.
 */
describe("getBodyMassIndex", () => {
  it("reads height as centimetres", () => {
    expect(getBodyMassIndex(70, 175)).toBe("22.86");
    expect(getBodyMassIndex(50, 160)).toBe("19.53");
  });

  it("keeps two decimals, so the value does not jitter as a weight is typed", () => {
    expect(getBodyMassIndex(70, 175)).toMatch(/^\d+\.\d{2}$/);
    expect(getBodyMassIndex(81, 180)).toBe("25.00");
  });

  it("answers for a child, where the numbers are small in both directions", () => {
    expect(getBodyMassIndex(12, 85)).toBe("16.61");
  });

  it("has no answer until both measurements are in", () => {
    // Undefined rather than a number, because the summary leaves the row blank.
    // A zero height would otherwise divide into Infinity.
    expect(getBodyMassIndex(70, 0)).toBeUndefined();
    expect(getBodyMassIndex(0, 175)).toBeUndefined();
    expect(getBodyMassIndex(0, 0)).toBeUndefined();
  });

  it("has no answer for a field that is empty or half-typed", () => {
    expect(getBodyMassIndex(undefined as never, 175)).toBeUndefined();
    expect(getBodyMassIndex(70, undefined as never)).toBeUndefined();
    expect(getBodyMassIndex(NaN, 175)).toBeUndefined();
    expect(getBodyMassIndex(70, NaN)).toBeUndefined();
  });

  it("rises with weight and falls with height", () => {
    const lighter = Number(getBodyMassIndex(60, 175));
    const heavier = Number(getBodyMassIndex(80, 175));
    const taller = Number(getBodyMassIndex(70, 190));
    const shorter = Number(getBodyMassIndex(70, 160));

    expect(heavier).toBeGreaterThan(lighter);
    expect(taller).toBeLessThan(shorter);
  });

  it("returns a string, which the caller renders and does not do arithmetic on", () => {
    expect(typeof getBodyMassIndex(70, 175)).toBe("string");
  });
});
