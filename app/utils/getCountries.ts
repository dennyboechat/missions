// Utils
import { COUNTRY_TIMEZONES } from "./countryTimezones";

export interface Country {
  code: string;
  name: string;
}

// Every country that has at least one IANA timezone, named in English and
// sorted the way a reader would expect to scan them.
export const getCountries = (): Country[] => {
  const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

  return Object.keys(COUNTRY_TIMEZONES)
    .map((code) => {
      let name = code;

      try {
        name = displayNames.of(code) ?? code;
      } catch {
        // Fall back to the raw code for anything ICU does not recognise.
      }

      return { code, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

// zone.tab lists canonical names only. The picker always stores one of those,
// so this matters mainly for prefilling from a browser that still reports a
// legacy alias (e.g. "US/Eastern"). Anything unmatched simply leaves the
// country blank for the user to choose.
export const getCountryCodeOfTimezone = ({
  timezone,
}: {
  timezone?: string;
}): string | undefined => {
  if (!timezone) return undefined;

  const lookup = (name: string) =>
    Object.keys(COUNTRY_TIMEZONES).find((code) =>
      COUNTRY_TIMEZONES[code].includes(name)
    );

  const direct = lookup(timezone);
  if (direct) return direct;

  try {
    const canonical = Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
    }).resolvedOptions().timeZone;

    return canonical === timezone ? undefined : lookup(canonical);
  } catch {
    return undefined;
  }
};

export const getCountryTimezones = ({
  countryCode,
}: {
  countryCode?: string;
}): string[] => (countryCode ? COUNTRY_TIMEZONES[countryCode] ?? [] : []);
