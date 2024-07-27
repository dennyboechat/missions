export const getDataTableTotalRecords = (records?: Record<string, any>[]) => {
  const totalRecords = records?.length || 0;

  return "total " + totalRecords + (totalRecords > 1 ? " records" : " record");
};
