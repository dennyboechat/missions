"use client";

// Components
import { Text } from "@radix-ui/themes";
import { ReportPanelList } from "./ReportPanelList";

// Types
import { ReportPanelSectionProps } from "../types/ReportPanelSectionProps";

// Styles
import styles from "../styles/ReportPanel.module.css";

export const ReportPanelSection = ({
  title,
  total,
  emptyMessage,
  isEmpty,
  children,
}: ReportPanelSectionProps) => (
  <div className={styles.section}>
    <div className={styles.section_header}>
      <Text size="4">{title}</Text>
      <Text size="5" className="mi-numeric">
        {total}
      </Text>
    </div>
    {isEmpty ? (
      <Text size="2" color="gray">
        {emptyMessage}
      </Text>
    ) : (
      <ReportPanelList>{children}</ReportPanelList>
    )}
  </div>
);
