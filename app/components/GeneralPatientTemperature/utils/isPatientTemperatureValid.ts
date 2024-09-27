export const isPatientTemperatureValid = (temperature: number) => {
  return temperature > 34 && temperature < 45;
};
