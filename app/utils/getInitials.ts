/**
 * The one or two letters that stand in for a name in an avatar.
 *
 * First and last word, so "Maria da Silva" reads MS rather than MD. Falls back
 * to the first letter for a single word, and to nothing for a name that is
 * only punctuation -- the caller shows the full name beside it either way.
 */
export const getInitials = (name?: string): string => {
  const words = (name ?? "")
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";

  return `${first}${last}`.toLocaleUpperCase();
};
