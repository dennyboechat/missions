export const getLocaleFormattedDate = ({ date }: { date: Date }) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
