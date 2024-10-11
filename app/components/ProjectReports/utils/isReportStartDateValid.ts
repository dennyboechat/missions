export const isReportStartDateValid = (startDate?: string) => {
  return startDate && startDate.trim().length > 0;
};
