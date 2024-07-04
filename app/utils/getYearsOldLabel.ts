export const getYearsOldLabel = ({ age }: { age: number }) => {
  return age + (age < 2 ? " year old" : " years old");
};
