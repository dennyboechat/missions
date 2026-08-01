// Today's calendar date in a given IANA timezone, as YYYY-MM-DD.
export const getTodayInTimezone = ({
  timeZone,
}: {
  timeZone: string;
}): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
};
