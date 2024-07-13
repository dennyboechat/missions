export interface DataTableProps {
  tableHeader: React.ReactNode;
  children: React.ReactNode;
  onSearchTextChange: (text?: string) => void;
  isSearchAutoFocus?: boolean;
  records: Record<string, any>[];
}
