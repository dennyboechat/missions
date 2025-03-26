export const getLocaleFormattedDate = ({ date }: { date: Date }) => {

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log('&&&&&&&&&&&& ' + userTimeZone);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: userTimeZone,
  }).format(date);
};
