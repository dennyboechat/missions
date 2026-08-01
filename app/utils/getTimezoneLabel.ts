const OFFSET_PROBE_MONTHS = [0, 3, 6, 9];

const getZoneNamePart = ({
  timezone,
  style,
  at,
}: {
  timezone: string;
  style: "longOffset" | "longGeneric";
  at: Date;
}) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: style,
    })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value;
  } catch {
    return undefined;
  }
};

// "GMT+13:00" -> "+13", "GMT-03:30" -> "-3:30", "GMT" -> "+0"
const tidyOffset = (raw: string) =>
  raw
    .replace("GMT", "")
    .replace(/:00$/, "")
    .replace(/^([+-])0(\d)/, "$1$2") || "+0";

const toMinutes = (raw: string) => {
  const match = raw.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  return (
    (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]))
  );
};

// Every offset a zone uses across the year, low to high: "UTC-8/-7" for a zone
// that observes daylight saving, "UTC-7" for one that does not.
export const getTimezoneOffsetRangeLabel = ({
  timezone,
}: {
  timezone: string;
}) => {
  const year = new Date().getUTCFullYear();

  const offsets = OFFSET_PROBE_MONTHS.map(
    (month) =>
      getZoneNamePart({
        timezone,
        style: "longOffset",
        at: new Date(Date.UTC(year, month, 15)),
      }) ?? "GMT"
  );

  const unique = Array.from(new Set(offsets)).sort(
    (a, b) => toMinutes(a) - toMinutes(b)
  );

  return `UTC${unique.map(tidyOffset).join("/")}`;
};

// "Pacific/Auckland" -> "Auckland"
export const getTimezoneCity = ({ timezone }: { timezone: string }) =>
  timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone;

// The name people actually use for the zone -- "Brasilia Standard Time",
// "Amazon Standard Time" -- taken from CLDR via Intl rather than a hand-built
// table. CLDR emits a bare "GMT-3" when it has no name for a zone, in which
// case the city is the better label.
export const getTimezoneName = ({ timezone }: { timezone: string }) => {
  const name = getZoneNamePart({
    timezone,
    style: "longGeneric",
    at: new Date(),
  });

  return !name || name.startsWith("GMT")
    ? getTimezoneCity({ timezone })
    : name;
};

export const getTimezoneLabel = ({ timezone }: { timezone: string }) =>
  `${getTimezoneName({ timezone })} (${getTimezoneOffsetRangeLabel({
    timezone,
  })})`;
