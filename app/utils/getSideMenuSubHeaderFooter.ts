export const getSideMenuSubHeaderFooter = ({
  isPatientMale,
}: {
  isPatientMale?: boolean;
}) => {
  const gender =
    isPatientMale === undefined ? "" : isPatientMale ? "male" : "female";

  return `${gender}`;
};
