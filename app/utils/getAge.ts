// Takes a plain YYYY-MM-DD date of birth. Parsing it into a Date first would
// re-interpret the day in the viewer's timezone and can shift it by one.
export const getAge = ({ date }: { date?: string }) => {
  if (!date) {
    return undefined;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDifference = today.getMonth() + 1 - month;

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < day)
  ) {
    age--;
  }

  return age;
};
