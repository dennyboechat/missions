export const subtractDaysToDate = ({
  date,
  days,
}: {
  date: string;
  days: number;
}) => {
  let result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};
