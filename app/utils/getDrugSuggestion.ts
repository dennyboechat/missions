// Utils
import { getNearestMatches } from "./getNearestMatches";
import { isSameName } from "./isSameName";

/**
 * The correction to offer for a drug name that was typed rather than picked.
 *
 * Returns an empty string when there is nothing to ask about, so callers can
 * use the result as the whole condition for showing the prompt. That covers two
 * cases: the name is already one of the known drugs, or nothing known is close
 * enough. A mission carries drugs this list does not, so an unrecognised name
 * is never blocked -- it just does not pass silently when it looks like a slip.
 */
export const getDrugSuggestion = ({
  drug,
  drugs,
}: {
  drug?: string;
  drugs: { name: string }[];
}) => {
  const typed = (drug ?? "").trim();

  if (!typed || drugs.some(({ name }) => isSameName(name, typed))) {
    return "";
  }

  const [nearest] = getNearestMatches({ query: typed, items: drugs, limit: 1 });

  return nearest?.name ?? "";
};
