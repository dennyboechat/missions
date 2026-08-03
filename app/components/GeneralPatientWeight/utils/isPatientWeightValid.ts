// The plausible range for a body weight, in kilograms.
//
// Declared in kilograms because that is what is stored, so a project working in
// pounds converts these for its field bounds (0-397lb) rather than keeping its
// own numbers. See toDisplayWeightBounds in utils/projectFormats.ts.
export const WEIGHT_MIN_KG = 0;
export const WEIGHT_MAX_KG = 180;

/** Takes kilograms, whatever unit the value was typed in. */
export const isPatientWeightValid = (weight: number) => {
  return weight >= WEIGHT_MIN_KG && weight <= WEIGHT_MAX_KG;
};
