/**
 * The one spelling a dose is stored in. Every write goes through here, which is
 * what makes "500", "500mg" and "500 mg" collapse into a single value the
 * project reports can consolidate.
 *
 * A unit on its own is not a dose, so an empty amount yields an empty string.
 */
export const formatDose = ({
  amount,
  unit,
}: {
  amount?: string;
  unit?: string;
}) => {
  const trimmedAmount = (amount ?? "").trim();
  const trimmedUnit = (unit ?? "").trim();

  if (!trimmedAmount) {
    return "";
  }

  if (!trimmedUnit) {
    return trimmedAmount;
  }

  // A percentage is written against the number, everything else is spaced.
  return trimmedUnit === "%"
    ? `${trimmedAmount}%`
    : `${trimmedAmount} ${trimmedUnit}`;
};
