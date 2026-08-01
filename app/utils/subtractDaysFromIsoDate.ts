// Shifts a YYYY-MM-DD string back by a number of days, staying in UTC so the
// arithmetic cannot cross a daylight-saving boundary in the viewer's zone.
export const subtractDaysFromIsoDate = ({
  date,
  days,
}: {
  date: string;
  days: number;
}): string => {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) return date;

  const shifted = new Date(Date.UTC(year, month - 1, day));
  shifted.setUTCDate(shifted.getUTCDate() - days);

  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    String(shifted.getUTCDate()).padStart(2, "0"),
  ].join("-");
};
