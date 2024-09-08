// Utils
import { getAge } from "./getAge";
import { getLocaleFormattedDate } from "./getLocaleFormattedDate";

export const getSideMenuSubHeader = ({
  patientDateOfBirth,
}: {
  patientDateOfBirth?: Date;
}) => {
  const patientAge = getAge({
    date: patientDateOfBirth,
  });

  const formattedDateOfBirth = patientDateOfBirth
    ? getLocaleFormattedDate({
        date: patientDateOfBirth,
      })
    : "";

  return `${formattedDateOfBirth} (${patientAge ?? ""}yo)`;
};
