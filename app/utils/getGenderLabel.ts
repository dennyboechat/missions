export const getGenderLabel = ({
  isPatientMale,
}: {
  isPatientMale: boolean;
}) => {
  return isPatientMale ? "Male" : "Female";
};
