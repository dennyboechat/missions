// Components
import { Table } from "@radix-ui/themes";

// Types
import { DataTableProps } from "../types/DataTableProps";

// Styles
import styles from "../styles/DataTable.module.css";

export const DataTable = ({ tableHeader, children }: DataTableProps) => (
  <Table.Root className={styles.table}>
    <Table.Header>{tableHeader}</Table.Header>
    <Table.Body>{children}</Table.Body>
  </Table.Root>
);
