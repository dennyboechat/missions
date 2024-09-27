export const isPatientOxygenSaturationValid = (oxygenSaturation: number) => {
  return oxygenSaturation >= 70 && oxygenSaturation <= 100;
};
