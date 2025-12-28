import { getUserTimezone } from "./getUserTimezone";

export const getFormattedDate = ({date, format}: {date?: Date, format?: string}) => {
  if (!date) return "";

  if (format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('yyyy', String(year))
      .replace('MM', month)
      .replace('dd', day);
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: getUserTimezone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
};
