// Components
import { Grid, Heading, Text } from "@radix-ui/themes";

// Types
import { ContentHeaderProps } from "../types/ContentHeaderProps";

// Styles
import styles from "../styles/ContentHeader.module.css";

export const ContentHeader = ({ text, subText }: ContentHeaderProps) => (
  <Grid gap='10px' className={styles.header}>
    <Heading>{text}</Heading>
    <Text>{subText}</Text>
  </Grid>
);
