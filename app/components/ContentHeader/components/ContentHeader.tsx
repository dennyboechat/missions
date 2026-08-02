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
      {subText && <Text className={styles.sub_title}>{subText}</Text>}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </div>
);
