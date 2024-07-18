// Components
import { Button } from "@radix-ui/themes";

// Types
import type { ToothButtonProps } from "../types/ToothButtonProps";

// Styles
import styles from "../styles/DentalMap.module.css";

export const ToothButton = ({
  id,
  top,
  left,
  isSelected,
  onClickTooth,
}: ToothButtonProps) => {
  const selectedToothClassname = isSelected ? styles.selected_tooth : undefined;

  return (
    <Button
      id={id}
      className={`${styles.tooth_button} ${selectedToothClassname}`}
      style={{ top, left }}
      onClick={() => onClickTooth(id)}
      variant="outline"
      size="1"
    >
      {id}
    </Button>
  );
};
