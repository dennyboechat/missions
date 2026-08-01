// Formats a YYYY-MM-DD string as "Mar 23, 2026".
//
// The date is pinned to UTC on the way in and formatted in UTC on the way out,
// so the rendered day is always the day that was stored. Formatting a bare
// Date here used to fall back to the viewer's timezone, which showed every
// midnight-UTC date one day early from anywhere west of Greenwich.
export const getLocaleFormattedDate = ({ date }: { date?: string }) => {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};
