export const isPatientBloodGlucoseValid = (bloodGlucose: number) => {
  return bloodGlucose >= 40 && bloodGlucose <= 600;
};
