export const subtractDaysToDate = ({
  date,
  days,
}: {
  date: Date;
  days: number;
}) => {
  date.setDate(date.getDate() - days);
  return date;
};
