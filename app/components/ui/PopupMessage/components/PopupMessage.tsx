"use client";

// Components
import { Box, Text } from "@radix-ui/themes";

// Hooks
import { useEffect } from "react";
import { usePopupMessage } from "../../../../lib/PopupMessage";

// Styles
import styles from "../styles/PopupMessage.module.css";

export const PopupMessage = () => {
  const { message, setMessage } = usePopupMessage();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  return message ? (
    <Box className={styles.popup_message}>
      <Text>{message}</Text>
    </Box>
  ) : null;
};
