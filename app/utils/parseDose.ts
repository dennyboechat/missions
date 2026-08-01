// Utils
import { getCanonicalDoseUnit } from "./getCanonicalDoseUnit";

// A leading number, then whatever follows it. The number may carry a decimal
// separator in either convention, so "0,5 mL" and "0.5 mL" are the same dose.
const amountAndUnit = /^([0-9]+(?:[.,][0-9]+)?)\s*(.*)$/;

export interface ParsedDose {
  amount: string;
  unit: string;
}

/**
 * Splits a stored dose into the two halves the form edits.
 *
 * Rows recorded before the unit was a picker are free text, so this has to be
 * lossless: anything it cannot read as a strength -- "as needed", "2 tablets
 * with food" -- comes back whole in the amount, with no unit. Guessing a unit
 * there would invent a dose that was never prescribed.
 */
export const parseDose = (dose?: string): ParsedDose => {
  const trimmed = (dose ?? "").trim();

  if (!trimmed) {
    return { amount: "", unit: "" };
  }

  const match = amountAndUnit.exec(trimmed);

  if (!match) {
    return { amount: trimmed, unit: "" };
  }

  const [, amount, rest] = match;
  const canonicalAmount = amount.replace(",", ".");

  if (!rest) {
    return { amount: canonicalAmount, unit: "" };
  }

  const unit = getCanonicalDoseUnit(rest);

  return unit
    ? { amount: canonicalAmount, unit }
    : { amount: trimmed, unit: "" };
};
