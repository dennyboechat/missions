// Utils
import { getCountryTimezones } from "./getCountries";
import { getTimezoneLabel } from "./getTimezoneLabel";

export interface TimezoneOption {
  /** The IANA zone stored for this choice. */
  value: string;
  /** What the user reads, e.g. "Belem (UTC-3)". */
  label: string;
  /** Every zone that behaves identically, so a stored one can be matched back. */
  zones: string[];
}

// Two zones with the same offset all year round bucket appointments into
// exactly the same calendar days, so offering both is noise -- Brazil has 16
// zones but only 4 distinct offsets. Sampling all four quarters keeps zones
// that differ only seasonally apart, which is what separates Phoenix (UTC-7
// year round) from Denver (UTC-7 in winter, UTC-6 in summer).
const getOffsetSignature = ({ timezone }: { timezone: string }): string => {
  const year = new Date().getUTCFullYear();

  return [0, 3, 6, 9]
    .map((month) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "longOffset",
      })
        .formatToParts(new Date(Date.UTC(year, month, 15)))
        .find((part) => part.type === "timeZoneName")?.value ?? ""
    )
    .join("|");
};

export const getCountryTimezoneOptions = ({
  countryCode,
}: {
  countryCode?: string;
}): TimezoneOption[] => {
  const grouped = new Map<string, string[]>();

  for (const timezone of getCountryTimezones({ countryCode })) {
    const signature = getOffsetSignature({ timezone });
    grouped.set(signature, [...(grouped.get(signature) ?? []), timezone]);
  }

  return Array.from(grouped.values()).map((zones) => ({
    // tzdata lists a country's principal zone first, so the head of the group
    // is the recognisable city rather than an alphabetical accident.
    value: zones[0],
    label: getTimezoneLabel({ timezone: zones[0] }),
    zones,
  }));
};

export const findTimezoneOption = ({
  options,
  timezone,
}: {
  options: TimezoneOption[];
  timezone?: string;
}): TimezoneOption | undefined =>
  timezone
    ? options.find((option) => option.zones.includes(timezone))
    : undefined;
