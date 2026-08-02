export interface DataTableFooterProps {
  records: Record<string, any>[];
  /** What the rows are, for the count: "patient", "user". Defaults to "record". */
  noun?: string;
}
