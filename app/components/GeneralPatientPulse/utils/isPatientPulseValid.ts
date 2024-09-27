export const isPatientPulseValid = (pulse: number) => {
  return pulse >= 30 && pulse <= 220;
};
