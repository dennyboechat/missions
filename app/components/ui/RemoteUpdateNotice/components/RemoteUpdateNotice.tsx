"use client";

// Components
import { Text } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Styles
import styles from "../styles/RemoteUpdateNotice.module.css";

/**
 * "Somebody else changed this page while you were on it."
 *
 * The page refreshes itself every ten seconds, which is what makes two clinicians
 * on one record workable -- and also what makes a figure change under someone's
 * eyes with nothing to explain it. This is the explanation. The records on screen
 * are already the new ones; there is nothing to reload and nothing to accept.
 *
 * It does not say who. Nothing in the schema records who last wrote a row, and a
 * name inferred from who else is on the page would be a guess -- right most of the
 * time, and wrong in exactly the situation where being told the truth matters.
 * "Another user" is the whole of what is known.
 */
export const RemoteUpdateNotice = ({
  onDismiss,
}: {
  onDismiss: () => void;
}) => (
  <div
    className={styles.notice}
    // Polite: it is worth knowing, and never worth cutting across whatever is
    // being read or typed at the time.
    role="status"
  >
    <span className={styles.icon}>
      <Icon name="info" size={16} />
    </span>
    <Text className={styles.message}>
      {"This page was updated by another user."}
    </Text>
    <button
      type="button"
      className={styles.dismiss}
      onClick={onDismiss}
      title="Dismiss"
      aria-label="Dismiss"
    >
      <Icon name="x" size={14} />
    </button>
  </div>
);
