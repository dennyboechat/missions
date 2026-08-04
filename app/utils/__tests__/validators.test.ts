import { describe, it, expect } from "vitest";

import { isValidEmail } from "../isValidEmail";
import { isValidDate } from "../isValidDate";
import { isValidPatientFullName } from "../isValidPatientFullName";
import { isValidProjectName } from "../isValidProjectName";
import { isSameName } from "../isSameName";

describe("isValidEmail", () => {
  it("accepts the addresses people are invited with", () => {
    for (const email of [
      "clinician@example.com",
      "first.last@example.org",
      "first.last+mission@sub.example.co.uk",
      "a_b-c%d@example.io",
      "UPPER@EXAMPLE.COM",
    ]) {
      expect(isValidEmail(email)).toBe(true);
    }
  });

  it("rejects an address with no domain to deliver to", () => {
    for (const email of [
      "clinician",
      "clinician@",
      "clinician@example",
      "@example.com",
      "clinician@example.c",
    ]) {
      expect(isValidEmail(email)).toBe(false);
    }
  });

  it("rejects surrounding space and text, rather than matching the middle of it", () => {
    // The pattern is anchored at both ends. Unanchored, a pasted "Name
    // <a@b.com>" would pass and be stored verbatim as the invitation address.
    expect(isValidEmail(" clinician@example.com")).toBe(false);
    expect(isValidEmail("clinician@example.com ")).toBe(false);
    expect(isValidEmail("Name <clinician@example.com>")).toBe(false);
    expect(isValidEmail("clinician@example.com, other@example.com")).toBe(false);
  });

  it("rejects nothing at all", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidDate", () => {
  it("accepts a plain calendar date", () => {
    expect(isValidDate("2026-03-23")).toBe(true);
    expect(isValidDate("1948-01-01")).toBe(true);
    expect(isValidDate("2026-12-31")).toBe(true);
  });

  it("rejects text that is not a date at all", () => {
    expect(isValidDate("not-a-date")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });

  it("rejects a month that does not exist", () => {
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("2026-00-01")).toBe(false);
  });

  it("rejects a day that does not exist in that month", () => {
    // Date rolls an impossible day forward instead of refusing it: 2026-02-30
    // parses as 2 March, so a date of birth typed a day too long was saved as
    // the wrong month without anybody being told.
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2026-04-31")).toBe(false);
    expect(isValidDate("2026-06-31")).toBe(false);
    expect(isValidDate("2026-01-00")).toBe(false);
    expect(isValidDate("2026-01-32")).toBe(false);
  });

  it("rejects a day that would roll into the next year", () => {
    // The worst of them: 2026-12-32 parsed as 1 January 2027, so the year was
    // wrong too.
    expect(isValidDate("2026-12-32")).toBe(false);
  });

  it("knows which Februaries have a 29th", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(isValidDate("2026-02-29")).toBe(false);
    // 2000 is a leap year and 1900 is not, which is the rule Date already knows
    // and this has to not get in the way of.
    expect(isValidDate("2000-02-29")).toBe(true);
    expect(isValidDate("1900-02-29")).toBe(false);
  });

  it("accepts the last day of every month", () => {
    const lastDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    lastDays.forEach((day, index) => {
      const month = String(index + 1).padStart(2, "0");

      expect(isValidDate(`2026-${month}-${day}`)).toBe(true);
      expect(isValidDate(`2026-${month}-${day + 1}`)).toBe(false);
    });
  });

  it("gives the same answer in every timezone", () => {
    // The check builds a date to read it back, so it has to build it in UTC: a
    // local-time date lands on the previous day west of Greenwich and would
    // reject a day that exists.
    const original = process.env.TZ;

    try {
      for (const tz of ["Pacific/Kiritimati", "Pacific/Fiji", "UTC", "America/Los_Angeles", "Pacific/Midway"]) {
        process.env.TZ = tz;

        expect(isValidDate("2026-03-01")).toBe(true);
        expect(isValidDate("2026-01-01")).toBe(true);
        expect(isValidDate("2026-12-31")).toBe(true);
        expect(isValidDate("2026-02-30")).toBe(false);
      }
    } finally {
      process.env.TZ = original;
    }
  });

  it("still accepts a timestamp, which is all it ever promised for one", () => {
    expect(isValidDate("2026-03-23T10:00:00Z")).toBe(true);
    expect(isValidDate("03/23/2026")).toBe(true);
  });

  it("is only as strict as Date about a shape that is not a plain padded date", () => {
    // The calendar check applies to YYYY-MM-DD, which is what a date input
    // produces and the only shape the date of birth field ever passes. Anything
    // else is judged on parseability alone, and V8 is generous: it reads an
    // unpadded date, and a trailing hyphen, as the first plausible day.
    expect(isValidDate("2026-3-4")).toBe(true);
    expect(isValidDate("2026-03-")).toBe(true);
    expect(isValidDate("20260304")).toBe(false);
  });
});

describe("isValidPatientFullName", () => {
  it("accepts a name someone actually typed", () => {
    expect(isValidPatientFullName({ patientFullName: "Maria da Silva" })).toBeTruthy();
  });

  it("does not accept a name that is only space", () => {
    // A record saved from a form where the field was tabbed through leaves a
    // patient nobody can find by name.
    expect(isValidPatientFullName({ patientFullName: "   " })).toBeFalsy();
    expect(isValidPatientFullName({ patientFullName: "\t\n" })).toBeFalsy();
  });

  it("does not accept a missing name", () => {
    expect(isValidPatientFullName({})).toBeFalsy();
    expect(isValidPatientFullName({ patientFullName: "" })).toBeFalsy();
  });

  it("accepts a name that has space around it, which the caller trims", () => {
    expect(isValidPatientFullName({ patientFullName: "  Maria  " })).toBeTruthy();
  });
});

describe("isValidProjectName", () => {
  it("accepts a named project and refuses an unnamed one", () => {
    expect(isValidProjectName({ projectName: "Fiji 2026" })).toBeTruthy();
    expect(isValidProjectName({ projectName: "" })).toBeFalsy();
    expect(isValidProjectName({ projectName: "   " })).toBeFalsy();
  });
});

describe("isSameName", () => {
  it("calls two spellings of one name the same name", () => {
    // Matches LOWER(TRIM(...)) in the queries, so the warning the user sees and
    // the constraint the database enforces agree on what is already taken.
    expect(isSameName("Maria da Silva", "maria da silva")).toBe(true);
    expect(isSameName("  Maria da Silva  ", "Maria da Silva")).toBe(true);
    expect(isSameName("MARIA DA SILVA", "maria da silva")).toBe(true);
  });

  it("keeps two different names apart", () => {
    expect(isSameName("Maria da Silva", "Maria da Silvas")).toBe(false);
    expect(isSameName("Maria da Silva", "Maria  da Silva")).toBe(false);
  });

  it("treats a missing name as an empty one rather than throwing", () => {
    expect(isSameName(undefined, undefined)).toBe(true);
    expect(isSameName("", undefined)).toBe(true);
    expect(isSameName("  ", undefined)).toBe(true);
    expect(isSameName("Maria", undefined)).toBe(false);
    expect(isSameName(undefined, "Maria")).toBe(false);
  });

  it("reads the same in either direction", () => {
    expect(isSameName("Maria", "maria")).toBe(isSameName("maria", "Maria"));
  });
});
