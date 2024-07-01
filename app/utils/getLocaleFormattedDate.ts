export const getLocaleFormattedDate = ({ date }: { date: Date }) => {
  return new Intl.DateTimeFormat().format(date);
};
