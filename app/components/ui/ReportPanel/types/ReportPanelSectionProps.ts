// Types
import { ReactNode } from "react";

export interface ReportPanelSectionProps {
  title: string;
  total: number;
  /** Shown in place of the rows when the group has none. */
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
}
