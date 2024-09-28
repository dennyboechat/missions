export const isPatientVisionLeftNormalDistanceValid = (
  normalDistance?: number
) => {
  return !normalDistance || (normalDistance >= 10 && normalDistance <= 20);
};
