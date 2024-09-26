"use client";

// Components
import { Button, ButtonProps } from "@radix-ui/themes";

// Types
import { ToothButtonProps } from "../types/ToothButtonProps";
import { ToothStatus } from "../../../../types/ToothStatus";
type ButtonColor = ButtonProps["color"];
type ButtonVariant = ButtonProps["variant"];

// Styles
import styles from "../styles/ToothButton.module.css";

export const ToothButton = ({
  id,
  top,
  left,
  isSelected,
  toothDetails,
  onClickTooth,
  ignoreAbsolutePosition,
}: ToothButtonProps) => {
  const selectedToothClassname = isSelected ? styles.selected_tooth : undefined;
  const toothButtonPositionClassname = ignoreAbsolutePosition
    ? undefined
    : styles.tooth_button_position;

  let color: ButtonColor = "gray";
  let variant: ButtonVariant = "soft";
  let title;
  if (toothDetails?.toothStatus === ToothStatus.EXTRACTED) {
    color = "bronze";
    variant = "solid";
    title = "Extracted";
  } else if (toothDetails?.toothStatus === ToothStatus.TREATED) {
    color = "green";
    variant = "solid";
    title = "Treated";
  } else if (toothDetails?.toothNotes) {
    color = "yellow";
    variant = "solid";
    title = "Notes";
  }

  return (
    <Button
      id={id}
      className={`${
        styles.tooth_button
      } ${toothButtonPositionClassname} ${selectedToothClassname} ${
        onClickTooth ? "" : styles.non_clickable
      }`}
      style={{ top, left }}
      color={color}
      variant={variant}
      onClick={() => (onClickTooth ? onClickTooth(id) : () => {})}
      size="1"
      title={title}
    >
      {id}
    </Button>
  );
};
