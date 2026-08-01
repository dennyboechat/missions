"use client";

// Components
import { Text } from "@radix-ui/themes";

// Types
import { ReportPanelRowProps } from "../types/ReportPanelRowProps";

// Styles
import styles from "../styles/ReportPanel.module.css";

export const ReportPanelRow = ({
  label,
  detail,
  quantity,
  share = 0,
}: ReportPanelRowProps) => (
  <div className={styles.row}>
    <div
      className={styles.row_fill}
      style={{ width: `${Math.round(share * 100)}%` }}
      aria-hidden
    />
    <Text className={styles.row_label} size="2" truncate>
      {label}
    </Text>
    {/* Always rendered, empty or not, so the quantities of every row line up in
        the same column. */}
    <Text className={styles.row_detail} size="2" color="gray">
      {detail ?? ""}
    </Text>
    <Text className={styles.row_quantity} size="2" weight="medium">
      {quantity}
    </Text>
  </div>
);
