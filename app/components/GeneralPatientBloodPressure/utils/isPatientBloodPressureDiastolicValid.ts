export const isPatientBloodPressureDiastolicValid = (
  bloodPressureDiastolic?: number
) => {
  return (
    !bloodPressureDiastolic ||
    (bloodPressureDiastolic >= 40 && bloodPressureDiastolic <= 150)
  );
};
