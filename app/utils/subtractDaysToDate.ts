export const subtractDaysToDate = ({
  date,
  days,
}: {
  date: Date;
  days: number;
}) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};
