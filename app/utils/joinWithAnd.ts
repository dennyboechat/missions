/** Renders a list the way a sentence reads: "a", "a and b", "a, b and c". */
export const joinWithAnd = (items: string[]) => {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};
