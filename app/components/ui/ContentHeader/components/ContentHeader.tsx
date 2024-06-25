// Components
import { Heading } from "@radix-ui/themes";

// Types
import { ContentHeaderProps } from "../types/ContentHeaderProps";

// Styles
import styles from "../styles/ContentHeader.module.css";

export const ContentHeader = ({ text }: ContentHeaderProps) => (
  <Heading className={styles.header}>{text}</Heading>
);
