/**
 * Ties a row's amount field to the row itself, so the drug field can hand focus
 * over once the drug is settled.
 */
export const getDoseAmountInputId = (rowId: string) => `dose-amount-${rowId}`;
