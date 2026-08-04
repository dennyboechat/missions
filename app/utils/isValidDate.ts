/** A plain calendar date, the shape a date input produces. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Whether a date string names a day that exists.
 *
 * A plain YYYY-MM-DD is checked part by part, because Date rolls an impossible
 * day forward rather than refusing it: "2026-02-30" parses happily as 2 March, so
 * a date of birth typed a day too long was saved as the wrong month -- and
 * "2026-12-32" as the wrong year. Reading the components back off the parsed date
 * is what catches it: a day that rolled is a day that changed.
 *
 * Anything else falls back to whether it can be parsed at all, which is all this
 * ever promised for a timestamp or a locale-formatted date.
 */
export const isValidDate = (dateString: string) => {
  const isoDate = ISO_DATE.exec(dateString ?? "");

  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]);
    const day = Number(isoDate[3]);

    // UTC throughout: a date built in local time can land on the day before for
    // a viewer west of Greenwich, which would reject a date that is fine.
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }

  return !Number.isNaN(new Date(dateString).getTime());
};
