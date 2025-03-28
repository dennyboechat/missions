export const getLocaleFormattedDate = ({ date }: { date: Date }) => {

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: userTimeZone,
  }).format(date);
};
