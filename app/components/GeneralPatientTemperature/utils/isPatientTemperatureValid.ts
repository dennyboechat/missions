// The plausible range for a body temperature, in Celsius.
//
// Declared in Celsius because that is what is stored, so a project working in
// Fahrenheit converts these for its field bounds (93-112°F) rather than keeping
// a second set of numbers that could drift from these.
export const TEMPERATURE_MIN_C = 34;
export const TEMPERATURE_MAX_C = 44;

/** Takes Celsius, whatever unit the value was typed in. */
export const isPatientTemperatureValid = (temperature: number) => {
  return temperature >= TEMPERATURE_MIN_C && temperature <= TEMPERATURE_MAX_C;
};
