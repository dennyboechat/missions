"use client";

// Components
import { Badge, Text } from "@radix-ui/themes";
import Link from "next/link";
import { Icon } from "../../ui/Icon";

// Types
import { ReactNode } from "react";
import { IconName } from "../../ui/Icon";

// Styles
import styles from "../styles/PatientSummary.module.css";

/**
 * One record type on the summary: personal, general or dental.
 *
 * The glyph is the same one the side menu uses for that section, so the card
 * and the menu item that opens it read as the same thing.
 */
export const SummarySection = ({
  icon,
  title,
  count,
  noun,
  href,
  sunken,
  children,
}: {
  icon: IconName;
  title: string;
  /** Shown as a badge beside the title. Omitted for sections that are not a list. */
  count?: number;
  noun?: string;
  /**
   * The page this section summarises. Given one, the heading carries a link to
   * it -- the summary is read-only, so it is also where someone realises they
   * need to go and add or correct something.
   */
  href?: string;
  sunken?: boolean;
  children: ReactNode;
}) => (
  <section
    className={`${styles.card}${sunken ? ` ${styles.card_sunken}` : ""}`}
  >
    <div className={styles.section_heading}>
      <h4 className={styles.section_title}>
        <span className={styles.section_icon}>
          <Icon name={icon} size={18} />
        </span>
        {title}
      </h4>
      {(count !== undefined || href) && (
        <div className={styles.section_meta}>
          {count !== undefined && (
            <Badge>
              {`${count} ${noun}${count === 1 ? "" : "s"}`}
            </Badge>
          )}
          {href && (
            // "Open" is enough beside its own heading, but a screen reader
            // reaching this out of order would get four identical links, so the
            // accessible name carries the section it belongs to.
            <Link
              href={href}
              prefetch
              aria-label={`Open ${title}`}
              className={styles.section_action}
            >
              {"Open"}
            </Link>
          )}
        </div>
      )}
    </div>
    {children}
  </section>
);

/** A label / value pair. Used for the personal details. */
export const SummaryRow = ({
  label,
  value,
  numeric,
}: {
  label: string;
  value?: ReactNode;
  numeric?: boolean;
}) => (
  <div className={styles.row}>
    <Text className={styles.row_label}>{label}</Text>
    {value ? (
      <Text className={`${styles.row_value}${numeric ? " mi-numeric" : ""}`}>
        {value}
      </Text>
    ) : (
      <Text className={styles.empty}>{"Not recorded"}</Text>
    )}
  </div>
);

/**
 * A measurement as it reads once recorded: the unit stays with the number and
 * the number takes the mono face, so a column of them lines up.
 */
export const SummaryVital = ({
  icon,
  label,
  value,
  unit,
}: {
  icon: IconName;
  label: string;
  value?: string | number;
  /** Text, or the measure's unit switch. */
  unit?: ReactNode;
}) => (
  <div className={styles.vital}>
    <span className={styles.vital_label}>
      <Icon name={icon} size={15} />
      {label}
    </span>
    {value === undefined || value === null || value === "" ? (
      <Text className={styles.empty}>{"—"}</Text>
    ) : (
      <Text className={styles.vital_value}>
        {value}
        {unit && <span className={styles.vital_unit}>{unit}</span>}
      </Text>
    )}
  </div>
);
