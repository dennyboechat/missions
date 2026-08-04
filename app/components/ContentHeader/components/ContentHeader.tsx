// Components
import { Heading, Text } from "@radix-ui/themes";

// Types
import { ContentHeaderProps } from "../types/ContentHeaderProps";

// Styles
import styles from "../styles/ContentHeader.module.css";

export const ContentHeader = ({
  text,
  subText,
  actions,
}: ContentHeaderProps) => (
  <div className={styles.header}>
    <div className={styles.heading}>
      <Heading as="h2" className={styles.title}>
        {text}
      </Heading>
      {/* Present but empty is not the same as absent: "" keeps the line, so a
          screen whose sub-heading counts something out of the database does not
          step its content down when the figure arrives. A screen with nothing to
          say under its title passes no subText at all. */}
      {subText !== undefined && (
        <Text className={styles.sub_title}>{subText}</Text>
      )}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </div>
);
