// Multivariate dependency
import { Dispatch, SetStateAction } from "react";

export interface ProjectReportsFilterProps {
  startDate?: string;
  setStartDate: Dispatch<SetStateAction<string>>;
  isStartDateInvalid?: boolean;
  endDate?: string;
  setEndDate: Dispatch<SetStateAction<string>>;
  isEndDateInvalid?: boolean;
  /** Warns, but does not block: the window is valid, just already closed. */
  isEndDateInPast?: boolean;
  onGenerateReports: () => void;
  onDownloadAllData: () => void;
}
