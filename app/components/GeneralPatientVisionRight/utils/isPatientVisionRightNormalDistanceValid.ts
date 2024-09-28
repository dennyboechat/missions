export const isPatientVisionRightNormalDistanceValid = (
  normalDistance?: number
) => {
  return !normalDistance || (normalDistance >= 10 && normalDistance <= 20);
};
