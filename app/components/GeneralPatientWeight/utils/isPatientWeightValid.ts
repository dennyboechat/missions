export const isPatientWeightValid = (weight: number) => {
  return weight > 0 && weight < 180;
};
