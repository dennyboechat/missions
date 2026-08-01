// Utils
import { getEditDistance } from "./getEditDistance";

/**
 * How far off a query is allowed to be before it stops being a slip and starts
 * being a different word. One wrong character in a four-letter name could be
 * anything; a long drug name absorbs a couple of slips and is still
 * unmistakable.
 */
const getTolerance = (length: number) =>
  Math.min(3, Math.max(1, Math.floor(length / 4)));

/**
 * The entries closest to a query that a substring search would miss entirely,
 * so a mistyped "Lossrtan" still reaches "Losartan".
 *
 * Longer names are also compared against just their opening, so a query that is
 * a near-miss on the first word -- "Amoxicilin" -- reaches
 * "Amoxicillin/Clavulanate" without being charged for the rest of the name.
 *
 * Queries under three characters are ignored: at that length nearly everything
 * is within tolerance of everything else.
 */
export const getNearestMatches = <Item extends { name: string }>({
  query,
  items,
  limit = 5,
}: {
  query: string;
  items: Item[];
  limit?: number;
}): Item[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 3) {
    return [];
  }

  const tolerance = getTolerance(normalizedQuery.length);

  return items
    .map((item) => {
      const name = item.name.toLowerCase();

      return {
        item,
        distance: Math.min(
          getEditDistance(normalizedQuery, name),
          getEditDistance(normalizedQuery, name.slice(0, normalizedQuery.length))
        ),
      };
    })
    .filter(({ distance }) => distance <= tolerance)
    .sort(
      (a, b) => a.distance - b.distance || a.item.name.localeCompare(b.item.name)
    )
    .slice(0, limit)
    .map(({ item }) => item);
};
