"use client";

// Components
import { Button } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { ActionsProps } from "../types/ActionsProps";
import { Medication } from "../../../../types/Medication";

// Icons
import { faRemove } from "@fortawesome/free-solid-svg-icons";

export const Actions = ({
  medicationUid,
  drug,
  setMedications,
}: ActionsProps) => {
  const onDeleteRow = () => {
    if (drug) {
      setMedications((prevMedications: Medication[]) =>
        prevMedications.filter((medication) => medication.uid !== medicationUid)
      );
    }
  };

  return (
    <Button variant="outline" disabled={!drug} title="Delete row" onClick={onDeleteRow}>
      <FontAwesomeIcon icon={faRemove} />
    </Button>
  );
};
