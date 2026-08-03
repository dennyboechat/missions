// A window that ends before today is a valid report, not a mistake -- it just
// cannot hold anything recorded since, which is worth saying out loud before
// someone reads the gap as data gone missing.
//
// "Today" is the mission's own day, so a report opened from another continent
// is not warned about a window that is still current where the work happened.
// Both dates are YYYY-MM-DD, so comparing them as strings compares them as days.
export const isReportEndDateInPast = ({
  endDate,
  today,
}: {
  endDate?: string;
  today?: string;
}) => Boolean(endDate && today && endDate < today);
