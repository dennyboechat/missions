export const isPatientBloodPressureSystolicValid = (
  bloodPressureSystolic?: number
) => {
  return (
    !bloodPressureSystolic ||
    (bloodPressureSystolic >= 70 && bloodPressureSystolic <= 250)
  );
};
