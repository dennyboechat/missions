import { describe, it, expect } from "vitest";

import {
  InvalidInputError,
  assertPresentText,
  assertEmailAddress,
  assertPastDate,
  assertBoolean,
  assertOptionalText,
} from "../fieldGuards";

// These guards stand in for the form when the request did not come from one,
// so the cases that matter are the ones a form would never send.

describe("assertPresentText", () => {
  it("returns the value trimmed", () => {
    expect(assertPresentText("  Ana Silva ", "patient_full_name")).toBe(
      "Ana Silva",
    );
  });

  it("rejects empty and whitespace-only text", () => {
    expect(() => assertPresentText("", "patient_full_name")).toThrow(
      InvalidInputError,
    );
    expect(() => assertPresentText("   ", "patient_full_name")).toThrow(
      InvalidInputError,
    );
    expect(() => assertPresentText(undefined, "patient_full_name")).toThrow(
      InvalidInputError,
    );
  });
});

describe("assertEmailAddress", () => {
  it("normalises to the one spelling the column stores", () => {
    expect(assertEmailAddress("  Denny@IDEXX.com ")).toBe("denny@idexx.com");
  });

  it("rejects anything that is not an address", () => {
    expect(() => assertEmailAddress("denny")).toThrow(InvalidInputError);
    expect(() => assertEmailAddress("denny@")).toThrow(InvalidInputError);
    expect(() => assertEmailAddress("")).toThrow(InvalidInputError);
  });
});

describe("assertPastDate", () => {
  it("accepts a plain date that has happened", () => {
    expect(assertPastDate("1990-03-23", "patient_date_of_birth")).toBe(
      "1990-03-23",
    );
  });

  it("rejects a date in the future", () => {
    expect(() => assertPastDate("2999-01-01", "patient_date_of_birth")).toThrow(
      InvalidInputError,
    );
  });

  it("rejects a day that does not exist", () => {
    // Parses as March 3rd if handed straight to Date, which is how an
    // impossible birthday would otherwise be stored as a real one.
    expect(() => assertPastDate("2001-02-31", "patient_date_of_birth")).toThrow(
      InvalidInputError,
    );
  });

  it("rejects anything that is not YYYY-MM-DD", () => {
    expect(() => assertPastDate("23/03/1990", "patient_date_of_birth")).toThrow(
      InvalidInputError,
    );
    expect(() =>
      assertPastDate("1990-03-23T00:00:00Z", "patient_date_of_birth"),
    ).toThrow(InvalidInputError);
  });

  it("rejects a date before the schema's floor", () => {
    expect(() => assertPastDate("1899-12-31", "patient_date_of_birth")).toThrow(
      InvalidInputError,
    );
  });
});

describe("assertBoolean", () => {
  it("accepts only a decided boolean", () => {
    expect(assertBoolean(false, "is_patient_male")).toBe(false);
    expect(() => assertBoolean(undefined, "is_patient_male")).toThrow(
      InvalidInputError,
    );
    expect(() => assertBoolean("true", "is_patient_male")).toThrow(
      InvalidInputError,
    );
  });
});

describe("assertOptionalText", () => {
  it("passes through absent values", () => {
    expect(assertOptionalText(undefined, "patient_phone_number")).toBe(
      undefined,
    );
  });

  it("trims and bounds what is there", () => {
    expect(assertOptionalText("  555 0100 ", "patient_phone_number")).toBe(
      "555 0100",
    );
    expect(() =>
      assertOptionalText("x".repeat(256), "patient_phone_number"),
    ).toThrow(InvalidInputError);
  });
});
