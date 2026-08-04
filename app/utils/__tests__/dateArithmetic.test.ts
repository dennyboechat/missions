import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { subtractDaysToDate } from "../subtractDaysToDate";
import { subtractDaysFromIsoDate } from "../subtractDaysFromIsoDate";
import { getFormattedDate } from "../getFormattedDate";
import { getCurrentDateTime } from "../getCurrentDateTime";
import { getUserTimezone } from "../getUserTimezone";

/**
 * All three of these walk the calendar with the runtime's local getters, so the
 * suite pins the timezone rather than inheriting the machine's -- otherwise the
 * assertions pass in Suva and fail in Portland, which is exactly the class of
 * bug being guarded against.
 */
const inTimezone = (timeZone: string, run: () => void) => {
  const original = process.env.TZ;
  process.env.TZ = timeZone;
  try {
    run();
  } finally {
    process.env.TZ = original;
  }
};

let originalTz: string | undefined;

beforeEach(() => {
  originalTz = process.env.TZ;
  process.env.TZ = "UTC";
});

afterEach(() => {
  process.env.TZ = originalTz;
  vi.useRealTimers();
});

/** The reports filter: today, and the same time of day some days back. */
const at = (iso: string) => new Date(iso);

const asDay = (date: Date) => getFormattedDate({ date, format: "yyyy-MM-dd" });

describe("subtractDaysToDate", () => {
  it("walks back the number of days asked for", () => {
    expect(subtractDaysToDate({ date: at("2026-03-23T10:30:00Z"), days: 7 }).toISOString())
      .toBe("2026-03-16T10:30:00.000Z");
  });

  it("walks back over the start of a month and of a year", () => {
    expect(asDay(subtractDaysToDate({ date: at("2026-03-01T12:00:00Z"), days: 1 })))
      .toBe("2026-02-28");
    expect(asDay(subtractDaysToDate({ date: at("2026-01-01T12:00:00Z"), days: 1 })))
      .toBe("2025-12-31");
  });

  it("counts the leap day", () => {
    expect(asDay(subtractDaysToDate({ date: at("2024-03-01T12:00:00Z"), days: 1 })))
      .toBe("2024-02-29");
  });

  it("walks back a month at a time without landing on the wrong day", () => {
    expect(asDay(subtractDaysToDate({ date: at("2026-03-31T12:00:00Z"), days: 30 })))
      .toBe("2026-03-01");
  });

  it("stands still for zero days", () => {
    const date = at("2026-03-23T10:30:00Z");

    expect(subtractDaysToDate({ date, days: 0 }).getTime()).toBe(date.getTime());
  });

  it("goes forward for a negative count", () => {
    expect(subtractDaysToDate({ date: at("2026-03-23T10:30:00Z"), days: -2 }).toISOString())
      .toBe("2026-03-25T10:30:00.000Z");
  });

  it("leaves the caller's date alone", () => {
    // The reports page holds one `currentDate` and derives both ends of the
    // filter from it; mutating it in place would move today.
    const date = at("2026-03-23T10:30:00Z");

    subtractDaysToDate({ date, days: 30 });

    expect(date.toISOString()).toBe("2026-03-23T10:30:00.000Z");
  });

  it("covers the default reports window without drifting", () => {
    const today = at("2026-03-23T00:00:00Z");
    const start = subtractDaysToDate({ date: today, days: 30 });

    expect(Math.round((today.getTime() - start.getTime()) / 86_400_000)).toBe(30);
  });

  it("lands on the same day of the month in every timezone", () => {
    for (const tz of ["Pacific/Kiritimati", "Pacific/Fiji", "UTC", "America/Los_Angeles", "Pacific/Midway"]) {
      inTimezone(tz, () => {
        // Noon local, so a day is never a few hours from the boundary in
        // whichever zone the reader is in.
        const today = new Date(2026, 2, 23, 12);

        expect(subtractDaysToDate({ date: today, days: 7 }).getDate()).toBe(16);
        expect(subtractDaysToDate({ date: today, days: 30 }).getMonth()).toBe(1);
      });
    }
  });

  it("keeps the time of day across a daylight saving change, so the window is whole days", () => {
    // The filter is a date range, so a whole number of calendar days is the
    // right answer even though it is not a whole number of 24-hour spans.
    inTimezone("America/Los_Angeles", () => {
      const today = new Date(2026, 2, 10, 12); // after the spring change
      const start = subtractDaysToDate({ date: today, days: 7 });

      expect(start.getDate()).toBe(3);
      expect(start.getHours()).toBe(12);
      expect(today.getTime() - start.getTime()).not.toBe(7 * 86_400_000);
    });
  });
});

/**
 * Walking a plain YYYY-MM-DD forward is subtractDaysFromIsoDate's job, with a
 * negative count -- it stays in the string and in UTC, so the answer cannot
 * depend on where it is read. The util that used to do this by parsing the
 * string into a Date and then walking the local calendar was a day short west of
 * UTC, and had no callers; it is gone.
 */
describe("walking a plain date forward", () => {
  it("adds days without leaving the string", () => {
    expect(subtractDaysFromIsoDate({ date: "2026-03-23", days: -3 })).toBe("2026-03-26");
    expect(subtractDaysFromIsoDate({ date: "2026-12-31", days: -1 })).toBe("2027-01-01");
  });

  it("gives the same day in every timezone, which is the point of it", () => {
    for (const tz of ["Pacific/Kiritimati", "Pacific/Fiji", "UTC", "America/Los_Angeles", "Pacific/Midway"]) {
      inTimezone(tz, () => {
        expect(subtractDaysFromIsoDate({ date: "2026-03-23", days: -3 })).toBe("2026-03-26");
      });
    }
  });
});

describe("getFormattedDate", () => {
  it("fills the tokens of the format it is given", () => {
    // The date input's `max` attribute, which only accepts this shape.
    expect(getFormattedDate({ date: at("2026-03-04T12:00:00Z"), format: "yyyy-MM-dd" }))
      .toBe("2026-03-04");
  });

  it("pads the month and the day to two digits", () => {
    expect(getFormattedDate({ date: at("2026-01-02T12:00:00Z"), format: "yyyy-MM-dd" }))
      .toBe("2026-01-02");
  });

  it("fills whatever order the format puts the tokens in", () => {
    expect(getFormattedDate({ date: at("2026-03-04T12:00:00Z"), format: "dd/MM/yyyy" }))
      .toBe("04/03/2026");
    expect(getFormattedDate({ date: at("2026-03-04T12:00:00Z"), format: "MM-dd-yyyy" }))
      .toBe("03-04-2026");
  });

  it("falls back to MM/DD/YYYY when no format is named", () => {
    expect(getFormattedDate({ date: at("2026-03-04T12:00:00Z") })).toBe("03/04/2026");
  });

  it("gives an empty string for no date, so a filter can start out unset", () => {
    expect(getFormattedDate({})).toBe("");
    expect(getFormattedDate({ date: undefined, format: "yyyy-MM-dd" })).toBe("");
  });

  it("leaves text in the format that is not a token", () => {
    expect(getFormattedDate({ date: at("2026-03-04T12:00:00Z"), format: "yyyy" })).toBe("2026");
  });

  it("reads the date in the runtime's own zone when a format is given", () => {
    // A formatted date is a local calendar day; the unformatted branch asks
    // getUserTimezone instead. Callers pass a Date they built locally, so the
    // two agree in the browser.
    inTimezone("Pacific/Kiritimati", () => {
      expect(getFormattedDate({ date: new Date(2026, 2, 4, 12), format: "yyyy-MM-dd" }))
        .toBe("2026-03-04");
    });

    inTimezone("Pacific/Midway", () => {
      expect(getFormattedDate({ date: new Date(2026, 2, 4, 12), format: "yyyy-MM-dd" }))
        .toBe("2026-03-04");
    });
  });
});

describe("getCurrentDateTime", () => {
  it("reads the clock now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-04T09:15:00Z"));

    expect(getCurrentDateTime().toISOString()).toBe("2026-08-04T09:15:00.000Z");
  });

  it("hands back a new Date each call, not a shared one", () => {
    const first = getCurrentDateTime();
    const second = getCurrentDateTime();

    first.setFullYear(1999);

    expect(second.getFullYear()).not.toBe(1999);
  });
});

describe("getUserTimezone", () => {
  it("answers UTC where there is no browser to ask", () => {
    // Server-rendered pages have no viewer timezone. UTC keeps the server and
    // the first client render agreeing on the same day.
    expect(typeof window).toBe("undefined");
    expect(getUserTimezone()).toBe("UTC");
  });
});
