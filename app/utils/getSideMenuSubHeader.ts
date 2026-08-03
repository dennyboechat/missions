// Utils
import { getAge } from "./getAge";
import { formatProjectDate } from "./projectFormats";

// Types
import { ProjectDateFormat } from "../types/ProjectTypes";

/**
 * The patient's date of birth and age for the side menu, or nothing at all.
 *
 * Each part is only spoken about if it is known. Interpolating them
 * unconditionally is what produced a bare " (yo)" -- on screen for every
 * patient while the record loaded, and permanently for anyone whose date of
 * birth was never recorded, which the column allows.
 */
export const getSideMenuSubHeader = ({
  patientDateOfBirth,
  dateFormat,
}: {
  patientDateOfBirth?: string;
  dateFormat: ProjectDateFormat;
}) => {
  if (!patientDateOfBirth) {
    return "";
  }

  const formattedDateOfBirth = formatProjectDate({
    date: patientDateOfBirth,
    dateFormat,
  });

  // A date that getAge cannot read still tells the reader something; the age
  // parenthetical is what gets dropped, not the whole line.
  const patientAge = getAge({ date: patientDateOfBirth });

  return patientAge === undefined
    ? formattedDateOfBirth
    : `${formattedDateOfBirth} (${patientAge}yo)`;
};
