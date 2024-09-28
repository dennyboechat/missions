export const getBodyMassIndex = (weight: number, height: number) => {
  const heightMeters = height / 100;
  const bmi = weight / (heightMeters * heightMeters);

  return bmi.toFixed(2);
};
