"use client";

// Components
import { Text } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Styles
import styles from "../styles/WarningContainer.module.css";

/**
 * A block of prose about the form it sits under.
 *
 * Two tones, and the difference between them is whether the user still has a
 * choice. A warning is something to weigh -- two people really can share a name
 * -- and the save goes through underneath it. An error is a closed door: what is
 * described cannot be saved, so it reads in rose and takes a different glyph,
 * because a message the user cannot act on must not look like one they can.
 */
export const WarningContainer = ({
  message,
  tone = "warning",
}: {
  message: string;
  tone?: "warning" | "error";
}) => (
  <div
    className={[styles.container, tone === "error" ? styles.error : undefined]
      .filter(Boolean)
      .join(" ")}
    // A warning is advisory. An error is the reason the form is not moving, so it
    // is announced rather than left for the user to come across.
    role={tone === "error" ? "alert" : "status"}
  >
    <span className={styles.icon}>
      <Icon name={tone === "error" ? "error" : "warning"} size={18} />
    </span>
    <Text>{message}</Text>
  </div>
);
