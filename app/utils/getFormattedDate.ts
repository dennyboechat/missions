export const getFormattedDate = (date?: Date) => {
  if (!date) return "";

  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
};
