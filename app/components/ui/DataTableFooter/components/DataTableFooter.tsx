"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";

// Types
import { DataTableFooterProps } from "../types/DataTableFooterProps";

// Styles
import styles from "../styles/DataTableFooter.module.css";

// Utils
import { getDataTableTotalRecords } from "../../../../utils/getDataTableTotalRecords";

export const DataTableFooter = ({ records, noun }: DataTableFooterProps) => (
  <Grid className={styles.data_table_footer}>
    <Text>{getDataTableTotalRecords(records, noun)}</Text>
  </Grid>
);
