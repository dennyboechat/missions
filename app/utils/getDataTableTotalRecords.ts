/**
 * "total 24 patients", "total 1 patient", "total 0 patients" -- lowercase and
 * unemphatic. Only exactly one takes the singular; zero reads as a plural in
 * English, which the previous `> 1` test got wrong.
 */
export const getDataTableTotalRecords = (
  records?: Record<string, any>[],
  noun = "record"
) => {
  const totalRecords = records?.length || 0;

  return `total ${totalRecords} ${noun}${totalRecords === 1 ? "" : "s"}`;
};
