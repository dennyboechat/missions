// Formats a YYYY-MM-DD string as MM/DD/YYYY.
//
// Deliberately string-only: parsing into a Date would re-interpret the day in
// the viewer's timezone and can shift it, which is what made the same clinic
// day appear twice in the appointments report.
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const getFormattedIsoDate = ({ date }: { date?: string }) => {
  if (!date) return "";

  // Shape-checked rather than just split: "not-a-date" also has three parts,
  // and would otherwise be rearranged into "a/date/not".
  const parts = date.match(ISO_DATE);

  if (!parts) return date;

  const [, year, month, day] = parts;

  return `${month}/${day}/${year}`;
};
