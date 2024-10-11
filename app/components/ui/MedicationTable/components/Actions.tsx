"use client";

// Components
import { Button } from "@radix-ui/themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Types
import { ActionsProps } from "../types/ActionsProps";
import { Medication } from "../../../../types/Medication";

// Icons
import { faRemove } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const Actions = ({
  medicationUid,
  drug,
  setMedications,
  deleteMedication,
}: ActionsProps) => {
  const { setMessage, setMessageType } = usePopupMessage();

  const onDeleteRow = async () => {
    if (!drug || !medicationUid) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.filter(
        (medication) => medication.medicationUid !== medicationUid
      )
    );

    const codeToRun = async () => {
      const deletedMedication = await deleteMedication(medicationUid);

      if (setMessage && setMessageType) {
        if (deletedMedication) {
          setMessage("Saved");
          setMessageType("regular");
        } else {
          setMessage("Error to save. Please try again.");
          setMessageType("error");
        }
      }
    };

    const runSuccess = await runWithRetries(codeToRun);
    if (!runSuccess && setMessage && setMessageType) {
      setMessage("Error to save. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <Button
      variant="outline"
      disabled={!drug}
      title="Delete row"
      onClick={onDeleteRow}
    >
      <FontAwesomeIcon icon={faRemove} />
    </Button>
  );
};
