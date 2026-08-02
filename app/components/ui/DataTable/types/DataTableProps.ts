export interface DataTableProps {
  tableHeader: React.ReactNode;
  children: React.ReactNode;
  onSearchTextChange: (text?: string) => void;
  isSearchAutoFocus?: boolean;
  records: Record<string, any>[];
  /**
   * Records are still on their way. Without this an unanswered fetch is
   * indistinguishable from an empty one, and the table says "no patients yet"
   * about a mission that has hundreds.
   */
  isLoading?: boolean;
  /** How many skeleton rows to draw while loading. Defaults to the header's column count. */
  columnCount?: number;
  /** What the rows are, for the count: "patient", "user". Defaults to "record". */
  noun?: string;
  searchPlaceholder?: string;
  /** Shown in place of the rows when there are none: names the record and says what will fill it. */
  emptyTitle?: string;
  emptyBody?: string;
  emptyAction?: React.ReactNode;
}
