export const isPatientVisionLeftTestedDistanceValid = (
  testedDistance?: number
) => {
  return !testedDistance || (testedDistance >= 10 && testedDistance <= 400);
};
