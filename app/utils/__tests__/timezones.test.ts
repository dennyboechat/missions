import { describe, it, expect } from "vitest";

import {
  getCountries,
  getCountryTimezones,
  getCountryCodeOfTimezone,
} from "../getCountries";
import {
  getCountryTimezoneOptions,
  findTimezoneOption,
} from "../getCountryTimezoneOptions";
import {
  getTimezoneLabel,
  getTimezoneName,
  getTimezoneOffsetRangeLabel,
  getTimezoneCity,
} from "../getTimezoneLabel";
import { COUNTRY_TIMEZONES } from "../countryTimezones";

describe("country data", () => {
  it("covers every country in the table with a readable name", () => {
    const countries = getCountries();
    expect(countries.length).toBe(Object.keys(COUNTRY_TIMEZONES).length);
    expect(countries.every((c) => c.name && c.name !== c.code)).toBe(true);
  });

  it("is sorted by name so the picker scans predictably", () => {
    const names = getCountries().map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("resolves the projects in use back to their country", () => {
    expect(getCountryCodeOfTimezone({ timezone: "Pacific/Fiji" })).toBe("FJ");
    expect(getCountryCodeOfTimezone({ timezone: "Indian/Antananarivo" })).toBe("MG");
    expect(getCountryCodeOfTimezone({ timezone: "Pacific/Auckland" })).toBe("NZ");
  });

  it("returns nothing for a zone that belongs to no country", () => {
    expect(getCountryCodeOfTimezone({ timezone: "UTC" })).toBeUndefined();
    expect(getCountryCodeOfTimezone({ timezone: "Mars/Olympus" })).toBeUndefined();
    expect(getCountryCodeOfTimezone({})).toBeUndefined();
  });

  it("holds only zones the runtime recognises", () => {
    for (const zones of Object.values(COUNTRY_TIMEZONES)) {
      for (const timezone of zones) {
        expect(() =>
          Intl.DateTimeFormat(undefined, { timeZone: timezone })
        ).not.toThrow();
      }
    }
  });
});

describe("getCountryTimezoneOptions", () => {
  // The reason for grouping at all: Brazil lists 16 zones but only 4 behave
  // differently, and offering 16 cities was noise.
  it("collapses zones that behave identically all year", () => {
    expect(getCountryTimezones({ countryCode: "BR" }).length).toBe(16);
    expect(getCountryTimezoneOptions({ countryCode: "BR" }).length).toBe(4);
  });

  it("keeps zones apart when they differ only seasonally", () => {
    const us = getCountryTimezoneOptions({ countryCode: "US" });
    const phoenix = us.find((o) => o.zones.includes("America/Phoenix"));
    const losAngeles = us.find((o) => o.zones.includes("America/Los_Angeles"));

    // Both read UTC-7 in summer, so a current-offset check would merge them.
    expect(phoenix).toBeDefined();
    expect(losAngeles).toBeDefined();
    expect(phoenix?.value).not.toBe(losAngeles?.value);
  });

  it("gives single-zone countries exactly one option", () => {
    expect(getCountryTimezoneOptions({ countryCode: "FJ" }).length).toBe(1);
    expect(getCountryTimezoneOptions({ countryCode: "MG" }).length).toBe(1);
  });

  it("returns nothing without a country", () => {
    expect(getCountryTimezoneOptions({})).toEqual([]);
    expect(getCountryTimezoneOptions({ countryCode: "ZZ" })).toEqual([]);
  });

  it("never offers two options with the same label", () => {
    for (const code of Object.keys(COUNTRY_TIMEZONES)) {
      const labels = getCountryTimezoneOptions({ countryCode: code }).map(
        (o) => o.label
      );
      expect(new Set(labels).size, `duplicate label in ${code}`).toBe(
        labels.length
      );
    }
  });

  it("maps every zone back to exactly one option", () => {
    for (const [code, zones] of Object.entries(COUNTRY_TIMEZONES)) {
      const options = getCountryTimezoneOptions({ countryCode: code });
      for (const timezone of zones) {
        const matches = options.filter((o) => o.zones.includes(timezone));
        expect(matches.length, `${timezone} matched ${matches.length}`).toBe(1);
      }
    }
  });
});

describe("findTimezoneOption", () => {
  it("finds the option holding a stored zone, representative or not", () => {
    const options = getCountryTimezoneOptions({ countryCode: "BR" });
    // Sao_Paulo is in the Brasilia group but is not its representative.
    const found = findTimezoneOption({ options, timezone: "America/Sao_Paulo" });
    expect(found?.zones).toContain("America/Sao_Paulo");
    expect(found?.value).toBe("America/Belem");
  });

  it("returns nothing for a zone from another country", () => {
    const options = getCountryTimezoneOptions({ countryCode: "BR" });
    expect(findTimezoneOption({ options, timezone: "Pacific/Fiji" })).toBeUndefined();
    expect(findTimezoneOption({ options, timezone: undefined })).toBeUndefined();
  });
});

describe("timezone labels", () => {
  it("uses the CLDR name people recognise", () => {
    expect(getTimezoneName({ timezone: "America/Belem" })).toBe("Brasilia Standard Time");
    expect(getTimezoneName({ timezone: "America/Manaus" })).toBe("Amazon Standard Time");
    expect(getTimezoneName({ timezone: "Pacific/Fiji" })).toBe("Fiji Standard Time");
  });

  it("shows a fixed zone as one offset and a DST zone as a range", () => {
    expect(getTimezoneOffsetRangeLabel({ timezone: "Pacific/Fiji" })).toBe("UTC+12");
    expect(getTimezoneOffsetRangeLabel({ timezone: "Indian/Antananarivo" })).toBe("UTC+3");
    expect(getTimezoneOffsetRangeLabel({ timezone: "America/Phoenix" })).toBe("UTC-7");
    expect(getTimezoneOffsetRangeLabel({ timezone: "America/Los_Angeles" })).toBe("UTC-8/-7");
  });

  it("orders a range low to high in either hemisphere", () => {
    expect(getTimezoneOffsetRangeLabel({ timezone: "Pacific/Auckland" })).toBe("UTC+12/+13");
    expect(getTimezoneOffsetRangeLabel({ timezone: "America/Santiago" })).toBe("UTC-4/-3");
  });

  it("keeps half-hour and quarter-hour offsets intact", () => {
    expect(getTimezoneOffsetRangeLabel({ timezone: "Asia/Kathmandu" })).toBe("UTC+5:45");
    expect(getTimezoneOffsetRangeLabel({ timezone: "Pacific/Chatham" })).toBe("UTC+12:45/+13:45");
  });

  it("strips the leading zero from single-digit offsets", () => {
    expect(getTimezoneOffsetRangeLabel({ timezone: "Africa/Lagos" })).toBe("UTC+1");
    expect(getTimezoneOffsetRangeLabel({ timezone: "Atlantic/Reykjavik" })).toBe("UTC+0");
  });

  it("derives a city from the zone path", () => {
    expect(getTimezoneCity({ timezone: "America/Sao_Paulo" })).toBe("Sao Paulo");
    expect(getTimezoneCity({ timezone: "America/Indiana/Indianapolis" })).toBe("Indianapolis");
  });

  it("combines name and offset", () => {
    expect(getTimezoneLabel({ timezone: "Pacific/Fiji" })).toBe("Fiji Standard Time (UTC+12)");
  });
});
