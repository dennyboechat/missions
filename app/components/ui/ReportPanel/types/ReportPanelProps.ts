// Types
import { ReactNode } from "react";

export interface ReportPanelProps {
  title: string;
  total: number;
  /** Extra context under the title, such as how many rows the list holds. */
  subtitle?: string;
  isLoadingReport?: boolean;
  /** Shown in place of the rows when the report found nothing. */
  emptyMessage: string;
  isEmpty: boolean;
  children: ReactNode;
}
