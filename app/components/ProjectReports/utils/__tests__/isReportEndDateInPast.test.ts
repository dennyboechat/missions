import { describe, it, expect } from "vitest";

import { isReportEndDateInPast } from "../isReportEndDateInPast";

describe("isReportEndDateInPast", () => {
  it("warns about a window that closed before today", () => {
    expect(
      isReportEndDateInPast({ endDate: "2025-03-10", today: "2025-03-11" })
    ).toBe(true);
  });

  it("stays quiet on a window ending today", () => {
    expect(
      isReportEndDateInPast({ endDate: "2025-03-11", today: "2025-03-11" })
    ).toBe(false);
  });

  it("stays quiet on a window still to close", () => {
    expect(
      isReportEndDateInPast({ endDate: "2025-03-12", today: "2025-03-11" })
    ).toBe(false);
  });

  // A day apart, a month apart and a year apart each have to compare on the
  // whole date: a string compare that only worked within one month would pass
  // the neighbouring-day case above and still be wrong here.
  it("compares whole dates, not the day number", () => {
    expect(
      isReportEndDateInPast({ endDate: "2025-02-28", today: "2025-03-01" })
    ).toBe(true);
    expect(
      isReportEndDateInPast({ endDate: "2024-12-31", today: "2025-01-01" })
    ).toBe(true);
    expect(
      isReportEndDateInPast({ endDate: "2025-03-30", today: "2025-04-02" })
    ).toBe(true);
  });

  // A half-typed or cleared field is the date field's business, not the
  // warning's -- it must not read as a closed window.
  it("says nothing when either date is missing", () => {
    expect(isReportEndDateInPast({ today: "2025-03-11" })).toBe(false);
    expect(isReportEndDateInPast({ endDate: "2025-03-10" })).toBe(false);
    expect(isReportEndDateInPast({ endDate: "", today: "2025-03-11" })).toBe(
      false
    );
    expect(isReportEndDateInPast({})).toBe(false);
  });
});
