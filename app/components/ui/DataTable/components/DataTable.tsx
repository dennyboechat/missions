// Components
import { Grid, Table, TextField } from "@radix-ui/themes";

// Types
import { DataTableProps } from "../types/DataTableProps";

// Styles
import styles from "../styles/DataTable.module.css";

// Hooks
import { useState, useEffect } from "react";

export const DataTable = ({
  tableHeader,
  children,
  onSearchTextChange,
  isSearchAutoFocus,
}: DataTableProps) => {
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const updateData = setTimeout(() => {
      if (onSearchTextChange) {
        onSearchTextChange(searchText);
      }
    }, 1000);

    return () => clearTimeout(updateData);
  }, [searchText, onSearchTextChange]);

  return (
    <>
      <Grid columns={{ initial: "1", sm: "2" }}>
        <span />
        <TextField.Root
          placeholder="Search..."
          autoFocus={isSearchAutoFocus}
          defaultValue={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Grid>
      <Table.Root className={styles.table}>
        <Table.Header>{tableHeader}</Table.Header>
        <Table.Body>{children}</Table.Body>
      </Table.Root>
    </>
  );
};
