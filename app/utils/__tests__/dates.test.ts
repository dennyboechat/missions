import { describe, it, expect, vi, afterEach } from "vitest";

import { getFormattedIsoDate } from "../getFormattedIsoDate";
import { getAge } from "../getAge";
import { isDentistryAdult } from "../isDentistryAdult";
import { subtractDaysFromIsoDate } from "../subtractDaysFromIsoDate";
import { getTodayInTimezone } from "../getTodayInTimezone";
import { isValidTimezone } from "../isValidTimezone";

afterEach(() => {
  vi.useRealTimers();
});

// Every function here takes a plain YYYY-MM-DD string. The bug this guards
// against is any of them parsing that into a Date, which re-interprets the day
// in the runtime's timezone and can shift it. The suite therefore runs the
// same assertions under a far-west and a far-east timezone.
const inTimezone = (timeZone: string, run: () => void) => {
  const original = process.env.TZ;
  process.env.TZ = timeZone;
  try {
    run();
  } finally {
    process.env.TZ = original;
  }
};

describe("getFormattedIsoDate", () => {
  it("renders YYYY-MM-DD as MM/DD/YYYY", () => {
    expect(getFormattedIsoDate({ date: "2026-03-23" })).toBe("03/23/2026");
  });

  it("does not shift the day in any timezone", () => {
    for (const tz of ["Pacific/Kiritimati", "Pacific/Fiji", "UTC", "America/Los_Angeles", "Pacific/Midway"]) {
      inTimezone(tz, () => {
        expect(getFormattedIsoDate({ date: "2026-01-01" })).toBe("01/01/2026");
        expect(getFormattedIsoDate({ date: "2026-12-31" })).toBe("12/31/2026");
      });
    }
  });

  it("returns empty for a missing date and passes through anything unparseable", () => {
    expect(getFormattedIsoDate({})).toBe("");
    expect(getFormattedIsoDate({ date: "" })).toBe("");
    expect(getFormattedIsoDate({ date: "not-a-date" })).toBe("not-a-date");
  });
});

describe("getAge", () => {
  it("counts whole years elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T12:00:00Z"));
    expect(getAge({ date: "2000-08-01" })).toBe(26);
    expect(getAge({ date: "2000-08-02" })).toBe(25);
    expect(getAge({ date: "2000-07-31" })).toBe(26);
  });

  it("does not count the birthday early in the month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(getAge({ date: "2000-04-01" })).toBe(25);
    expect(getAge({ date: "2000-03-01" })).toBe(26);
  });

  it("returns undefined without a usable date", () => {
    expect(getAge({})).toBeUndefined();
    expect(getAge({ date: "" })).toBeUndefined();
    expect(getAge({ date: "garbage" })).toBeUndefined();
  });
});

describe("isDentistryAdult", () => {
  it("treats over-18 as adult", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T12:00:00Z"));
    expect(isDentistryAdult({ dateOfBirth: "2000-01-01" })).toBe(true);
    expect(isDentistryAdult({ dateOfBirth: "2020-01-01" })).toBe(false);
    // Exactly 18 is not "> 18".
    expect(isDentistryAdult({ dateOfBirth: "2008-01-01" })).toBe(false);
  });
});

describe("subtractDaysFromIsoDate", () => {
  it("walks back across month and year boundaries", () => {
    expect(subtractDaysFromIsoDate({ date: "2026-03-15", days: 14 })).toBe("2026-03-01");
    expect(subtractDaysFromIsoDate({ date: "2026-03-01", days: 1 })).toBe("2026-02-28");
    expect(subtractDaysFromIsoDate({ date: "2026-01-01", days: 1 })).toBe("2025-12-31");
  });

  it("handles a leap day", () => {
    expect(subtractDaysFromIsoDate({ date: "2024-03-01", days: 1 })).toBe("2024-02-29");
  });

  // The arithmetic runs in UTC precisely so a DST transition in the runtime's
  // zone cannot add or drop an hour and land on the wrong day.
  it("is unaffected by a daylight-saving transition", () => {
    inTimezone("America/New_York", () => {
      expect(subtractDaysFromIsoDate({ date: "2026-03-09", days: 1 })).toBe("2026-03-08");
      expect(subtractDaysFromIsoDate({ date: "2026-11-02", days: 1 })).toBe("2026-11-01");
    });
  });
});

describe("getTodayInTimezone", () => {
  it("gives the local calendar date, not the UTC one", () => {
    vi.useFakeTimers();
    // 2026-03-22 20:00 UTC is already the 23rd in Fiji and still the 22nd in UTC.
    vi.setSystemTime(new Date("2026-03-22T20:00:00Z"));
    expect(getTodayInTimezone({ timeZone: "Pacific/Fiji" })).toBe("2026-03-23");
    expect(getTodayInTimezone({ timeZone: "UTC" })).toBe("2026-03-22");
    expect(getTodayInTimezone({ timeZone: "America/Los_Angeles" })).toBe("2026-03-22");
  });

  it("zero-pads month and day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T12:00:00Z"));
    expect(getTodayInTimezone({ timeZone: "UTC" })).toBe("2026-01-05");
  });
});

describe("isValidTimezone", () => {
  it("accepts real IANA names and rejects everything else", () => {
    expect(isValidTimezone({ timezone: "Pacific/Fiji" })).toBe(true);
    expect(isValidTimezone({ timezone: "Indian/Antananarivo" })).toBe(true);
    expect(isValidTimezone({ timezone: "UTC" })).toBe(true);
    expect(isValidTimezone({ timezone: "Mars/Olympus" })).toBe(false);
    expect(isValidTimezone({ timezone: "" })).toBe(false);
    expect(isValidTimezone({})).toBe(false);
  });
});
