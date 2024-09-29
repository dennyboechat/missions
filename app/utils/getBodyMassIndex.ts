export const getBodyMassIndex = (weight: number, height: number) => {
  if (!weight || !height) {
    return undefined;
  }

  const heightMeters = height / 100;
  const bmi = weight / (heightMeters * heightMeters);

  return bmi.toFixed(2);
};
