// Utils
import { getAge } from "./getAge";

export const isDentistryAdult = ({ dateOfBirth }: { dateOfBirth: string }) => {
  const age = getAge({ date: dateOfBirth });
  return (age ?? 0) > 18;
};
