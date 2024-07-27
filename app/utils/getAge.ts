export const getAge = ({ date }: { date?: Date }) => {
  if (!date) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < date.getDate())
  ) {
    age--;
  }

  return age;
};
