"use client";

// Components
import { Text } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Styles
import styles from "../styles/WarningContainer.module.css";

export const WarningContainer = ({ message }: { message: string }) => (
  <div className={styles.container}>
    <span className={styles.icon}>
      <Icon name="warning" size={18} />
    </span>
    <Text>{message}</Text>
  </div>
);
