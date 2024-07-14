// Utils
import { getAge } from "./getAge";

export const isDentistryAdult = ({ dateOfBirth }: { dateOfBirth: Date }) => {
  const age = getAge({ date: dateOfBirth });
  return (age ?? 0) > 18;
};
