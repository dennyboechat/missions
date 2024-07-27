"use client";

// Components
import { Grid, Table } from "@radix-ui/themes";
import { DataTableSearch } from "../../DataTableSearch";
import { DataTableFooter } from "../../DataTableFooter";

// Types
import { DataTableProps } from "../types/DataTableProps";

// Styles
import styles from "../styles/DataTable.module.css";

export const DataTable = ({
  tableHeader,
  children,
  onSearchTextChange,
  isSearchAutoFocus,
  records,
}: DataTableProps) => (
  <>
    <Grid columns={{ initial: "1", sm: "60% 40%" }}>
      <span />
      <DataTableSearch
        isSearchAutoFocus={isSearchAutoFocus}
        onSearchTextChange={onSearchTextChange}
      />
    </Grid>
    <Table.Root className={styles.table}>
      <Table.Header>{tableHeader}</Table.Header>
      <Table.Body>{children}</Table.Body>
    </Table.Root>
    <DataTableFooter records={records} />
  </>
);
