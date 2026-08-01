/**
 * Spellings that all mean the same unit, written the way people type them:
 * lower case, no punctuation. Doses recorded before the unit was a picker, and
 * doses typed straight into the amount field, both arrive this way.
 *
 * A bare "u" for IU is deliberately absent. It is the classic misread -- "10u"
 * taken as "100" -- and a dose is not the place to guess.
 */
const doseUnitAliases: Record<string, string> = {
  mcg: "mcg",
  mcgs: "mcg",
  ug: "mcg",
  "µg": "mcg",
  microgram: "mcg",
  micrograms: "mcg",

  mg: "mg",
  mgs: "mg",
  milligram: "mg",
  milligrams: "mg",

  g: "g",
  gm: "g",
  gms: "g",
  gram: "g",
  grams: "g",

  ml: "mL",
  mls: "mL",
  cc: "mL",
  milliliter: "mL",
  milliliters: "mL",
  millilitre: "mL",
  millilitres: "mL",

  l: "L",
  liter: "L",
  liters: "L",
  litre: "L",
  litres: "L",

  iu: "IU",
  ius: "IU",
  unit: "IU",
  units: "IU",
  "international unit": "IU",
  "international units": "IU",

  meq: "mEq",
  meqs: "mEq",
  milliequivalent: "mEq",
  milliequivalents: "mEq",

  "%": "%",
  pct: "%",
  percent: "%",
};

/**
 * The stored spelling of a unit, or an empty string when the text is not a unit
 * this recognises. Callers treat the empty string as "leave the dose alone"
 * rather than as a unit, so nothing is invented for text like "as needed".
 */
export const getCanonicalDoseUnit = (unit?: string) => {
  const normalized = (unit ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  return normalized ? (doseUnitAliases[normalized] ?? "") : "";
};
