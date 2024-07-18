// Utils
import { getAge } from "./getAge";

export const getSideMenuSubHeader = ({
  patientDateOfBirth,
  isPatientMale,
}: {
  patientDateOfBirth?: Date;
  isPatientMale?: boolean;
}) => {
  const patientAge = getAge({
    date: patientDateOfBirth,
  });

  const gender = isPatientMale === undefined ? '' : (isPatientMale ? "male" : "female");

  return `${patientAge ?? ""}yo | ${gender}`;
};
