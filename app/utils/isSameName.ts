/**
 * Whether two names refer to the same entry as far as a duplicate check is
 * concerned: case and surrounding spaces are not a difference.
 *
 * Matches the comparison the queries use, LOWER(TRIM(...)), so the client and
 * the database agree on what counts as taken.
 */
export const isSameName = (name?: string, otherName?: string) =>
  (name ?? "").trim().toLowerCase() === (otherName ?? "").trim().toLowerCase();
