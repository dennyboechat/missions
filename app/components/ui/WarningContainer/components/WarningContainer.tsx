"use client";

// Components
import { Container, Text } from "@radix-ui/themes";

// Styles
import styles from "../styles/WarningContainer.module.css";

export const WarningContainer = ({ message }: { message: string }) => (
  <Container className={styles.container}>
    <Text>{message}</Text>
  </Container>
);
