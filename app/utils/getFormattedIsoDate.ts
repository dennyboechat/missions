// Formats a YYYY-MM-DD string as MM/DD/YYYY.
//
// Deliberately string-only: parsing into a Date would re-interpret the day in
// the viewer's timezone and can shift it, which is what made the same clinic
// day appear twice in the appointments report.
export const getFormattedIsoDate = ({ date }: { date?: string }) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return date;

  return `${month}/${day}/${year}`;
};
