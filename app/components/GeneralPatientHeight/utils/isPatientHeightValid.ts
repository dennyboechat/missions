// The plausible range for a human height, in centimetres.
//
// Declared in centimetres because that is what is stored: the rule is about the
// patient, not about the notation, so a project working in inches converts these
// for its field bounds rather than keeping its own numbers. See
// toDisplayLengthBounds in utils/projectFormats.ts.
export const HEIGHT_MIN_CM = 0;
export const HEIGHT_MAX_CM = 220;

/** Takes centimetres, whatever unit the value was typed in. */
export const isPatientHeightValid = (height: number) => {
  return height >= HEIGHT_MIN_CM && height <= HEIGHT_MAX_CM;
};
