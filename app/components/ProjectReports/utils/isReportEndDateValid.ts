export const isReportEndDateValid = (endDate?: string) => {
  return endDate && endDate.trim().length > 0;
};
