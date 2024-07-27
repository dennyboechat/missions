"use client";

// Components
import { Button, ButtonProps } from "@radix-ui/themes";

// Types
import { ToothButtonProps } from "../types/ToothButtonProps";
import { ToothStatus } from "../../../../types/ToothStatus";
type ButtonColor = ButtonProps["color"];
type ButtonVariant = ButtonProps["variant"];

// Styles
import styles from "../styles/DentalMap.module.css";

export const ToothButton = ({
  id,
  top,
  left,
  isSelected,
  toothDetails,
  onClickTooth,
}: ToothButtonProps) => {
  const selectedToothClassname = isSelected ? styles.selected_tooth : undefined;

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
      className={`${styles.tooth_button} ${selectedToothClassname}`}
      style={{ top, left }}
      color={color}
      variant={variant}
      onClick={() => onClickTooth(id)}
      size="1"
      title={title}
    >
      {id}
    </Button>
  );
};
