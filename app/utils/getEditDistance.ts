/**
 * How many single-character insertions, deletions or substitutions separate two
 * strings -- the Levenshtein distance. "Lossrtan" is one away from "Losartan".
 *
 * Only two rows of the matrix are ever live at once, so the cost is the length
 * of the shorter string rather than the product of both.
 */
export const getEditDistance = (text: string, otherText: string) => {
  if (text === otherText) {
    return 0;
  }

  if (!text.length) {
    return otherText.length;
  }

  if (!otherText.length) {
    return text.length;
  }

  let previousRow = Array.from({ length: otherText.length + 1 }, (_, index) => index);

  for (let row = 1; row <= text.length; row++) {
    const currentRow = [row];

    for (let column = 1; column <= otherText.length; column++) {
      const substitutionCost = text[row - 1] === otherText[column - 1] ? 0 : 1;

      currentRow[column] = Math.min(
        currentRow[column - 1] + 1,
        previousRow[column] + 1,
        previousRow[column - 1] + substitutionCost
      );
    }

    previousRow = currentRow;
  }

  return previousRow[otherText.length];
};
