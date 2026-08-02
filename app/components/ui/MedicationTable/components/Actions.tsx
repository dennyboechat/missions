"use client";

// Components
import { IconButton } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Styles
import styles from "../styles/MedicationTable.module.css";

// Types
import { ActionsProps } from "../types/ActionsProps";
import { Medication } from "../../../../types/Medication";

// Hooks
import { useSaveField } from "../../../../lib/useSaveField";

// Utils

export const Actions = ({
  medicationUid,
  drug,
  setMedications,
  deleteMedication,
}: ActionsProps) => {
  const { save } = useSaveField();

  const onDeleteRow = async () => {
    if (!drug || !medicationUid) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.filter(
        (medication) => medication.medicationUid !== medicationUid
      )
    );

    await save(() => deleteMedication(medicationUid));
  };

  return (
    <IconButton
      variant="ghost"
      disabled={!drug}
      title="Delete row"
      aria-label="Delete row"
      onClick={onDeleteRow}
      className={styles.delete_button}
    >
      <Icon name="trash" size={16} />
    </IconButton>
  );
};
