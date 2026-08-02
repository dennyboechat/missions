"use client";

// Types
import { ToothButtonProps } from "../types/ToothButtonProps";
import { ToothStatus } from "../../../../types/ToothStatus";

// Styles
import styles from "../styles/ToothButton.module.css";

/**
 * One tooth on the odontogram.
 *
 * A plain button rather than a themed one: the four states are clinical, and
 * the design system gives each its own token, so mapping them onto the generic
 * accent palette would put the meaning at the mercy of the theme.
 */
export const ToothButton = ({
  id,
  top,
  left,
  isSelected,
  toothDetails,
  onClickTooth,
  ignoreAbsolutePosition,
}: ToothButtonProps) => {
  let statusClassname;
  let title;

  if (toothDetails?.toothStatus === ToothStatus.EXTRACTED) {
    statusClassname = styles.extracted;
    title = "Extracted";
  } else if (toothDetails?.toothStatus === ToothStatus.TREATED) {
    statusClassname = styles.treated;
    title = "Treated";
  } else if (toothDetails?.toothNotes) {
    statusClassname = styles.has_notes;
    title = "Notes";
  }

  const classNames = [
    styles.tooth_button,
    ignoreAbsolutePosition ? undefined : styles.tooth_button_position,
    statusClassname,
    isSelected ? styles.selected_tooth : undefined,
    onClickTooth ? undefined : styles.non_clickable,
  ].filter(Boolean);

  return (
    <button
      type="button"
      id={id}
      className={classNames.join(" ")}
      style={{ top, left }}
      aria-pressed={isSelected}
      onClick={() => onClickTooth?.(id)}
      title={title}
    >
      {id}
    </button>
  );
};
