"use client";

// Components
import { Skeleton, Text } from "@radix-ui/themes";

// Types
import { ReportPanelProps } from "../types/ReportPanelProps";

// Styles
import styles from "../styles/ReportPanel.module.css";

export const ReportPanel = ({
  title,
  total,
  subtitle,
  isLoadingReport,
  emptyMessage,
  isEmpty,
  children,
}: ReportPanelProps) => {
  // The skeleton takes the panel's own height so the pair does not jump into
  // alignment only once both reports have arrived.
  if (isLoadingReport) {
    return <Skeleton className={styles.panel} />;
  }

  return (
    <section className={styles.panel}>
      <header className={styles.panel_header}>
        <div>
          <Text size="5">{title}</Text>
          {subtitle ? (
            <Text className={styles.panel_subtitle} size="2" color="gray">
              {subtitle}
            </Text>
          ) : null}
        </div>
        <Text size="7" className="mi-numeric">
          {total}
        </Text>
      </header>
      <div className={styles.panel_body}>
        {isEmpty ? (
          <Text size="2" color="gray">
            {emptyMessage}
          </Text>
        ) : (
          children
        )}
      </div>
    </section>
  );
};
