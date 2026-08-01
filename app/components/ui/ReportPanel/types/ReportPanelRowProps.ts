export interface ReportPanelRowProps {
  label: string;
  /** Secondary value kept in its own column, such as a medication dose. */
  detail?: string;
  quantity: number;
  /** 0 to 1, how much of the row is filled. */
  share?: number;
}
