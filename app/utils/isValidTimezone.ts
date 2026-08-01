export const isValidTimezone = ({
  timezone,
}: {
  timezone?: string;
}): boolean => {
  if (!timezone) return false;

  try {
    // Throws RangeError on an unknown IANA name.
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};
