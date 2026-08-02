"use client";

// Components
import { Skeleton, Table, Text } from "@radix-ui/themes";
import { DataTableSearch } from "../../DataTableSearch";
import { DataTableFooter } from "../../DataTableFooter";
import { Icon } from "../../Icon";

// Types
import { DataTableProps } from "../types/DataTableProps";
import { isValidElement, Children } from "react";

// Styles
import styles from "../styles/DataTable.module.css";

const SKELETON_ROWS = [0, 1, 2, 3, 4];

/**
 * How many columns the caller's header row declares. Reading it off the header
 * keeps the skeleton in step with the real table without asking every call site
 * to repeat the count.
 */
const getColumnCount = (tableHeader: React.ReactNode) => {
  if (!isValidElement<{ children?: React.ReactNode }>(tableHeader)) {
    return 1;
  }

  return Children.count(tableHeader.props.children) || 1;
};

export const DataTable = ({
  tableHeader,
  children,
  onSearchTextChange,
  isSearchAutoFocus,
  records,
  isLoading,
  columnCount,
  noun,
  searchPlaceholder,
  emptyTitle = "Nothing here yet",
  emptyBody,
  emptyAction,
}: DataTableProps) => {
  const isEmpty = !isLoading && records.length === 0;
  const columns = columnCount ?? getColumnCount(tableHeader);

  return (
    <>
      <div className={styles.toolbar}>
        <DataTableSearch
          isSearchAutoFocus={isSearchAutoFocus}
          placeholder={searchPlaceholder}
          onSearchTextChange={onSearchTextChange}
        />
      </div>
      <div className={styles.table_frame}>
        <Table.Root variant="ghost" className={styles.table}>
          <Table.Header>{tableHeader}</Table.Header>
          <Table.Body>
            {isLoading
              ? SKELETON_ROWS.map((row) => (
                  <Table.Row key={row}>
                    {Array.from({ length: columns }, (_, column) => (
                      <Table.Cell key={column}>
                        <Skeleton
                          height="13px"
                          width={column === 0 ? "62%" : "40%"}
                        />
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              : children}
          </Table.Body>
        </Table.Root>
        {/* An empty table is otherwise a header row over nothing, which reads
            as a failure rather than as a record type waiting to be filled. */}
        {isEmpty && (
          <div className={styles.empty}>
            <span className={styles.empty_glyph}>
              <Icon name="inbox" size={21} />
            </span>
            <Text className={styles.empty_title}>{emptyTitle}</Text>
            {emptyBody && (
              <Text className={styles.empty_body}>{emptyBody}</Text>
            )}
            {emptyAction}
          </div>
        )}
      </div>
      {!isLoading && !isEmpty && (
        <DataTableFooter records={records} noun={noun} />
      )}
    </>
  );
};
