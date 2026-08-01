/**
 * The units a dose may be recorded in, in the spelling they are stored in.
 *
 * The dose lives in a single column, so this list is what keeps "500", "500mg"
 * and "500 mg" from becoming three separate medications in the reports: the
 * amount is typed, the unit is picked from here, and the two are always joined
 * the same way.
 */
export const getDoseUnits = () => ["mcg", "mg", "g", "mL", "L", "IU", "mEq", "%"];
