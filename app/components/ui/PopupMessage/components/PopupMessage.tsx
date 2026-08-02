"use client";

// Components
import { Box, Text } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Hooks
import { useEffect } from "react";
import { usePopupMessage } from "../../../../lib/PopupMessage";

// Styles
import styles from "../styles/PopupMessage.module.css";

export const PopupMessage = () => {
  const { message, setMessage, messageType } = usePopupMessage();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(
        () => {
          if (setMessage) {
            setMessage(undefined);
          }
        },
        messageType === "error" ? 10000 : 3000
      );

      return () => clearTimeout(timer);
    }
  }, [message, setMessage, messageType]);

  return message ? (
    <Box
      role="status"
      className={`${styles.popup_message} ${
        messageType === "error" ? styles.popup_error : ""
      }`}
    >
      <Icon name={messageType === "error" ? "warning" : "check"} size={16} />
      <Text>{message}</Text>
    </Box>
  ) : null;
};
