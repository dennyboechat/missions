"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { InstructionsProps } from "../types/InstructionsProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const InstructionsInput = ({
  drug,
  instructions,
  medicationUid,
  setMedications,
  updateMedication,
}: InstructionsProps) => {
  const { setMessage, setMessageType } = usePopupMessage();

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!drug || !medicationUid || instructions === value) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.medicationUid === medicationUid
          ? { ...medication, instructions: value }
          : medication
      )
    );

    const codeToRun = async () => {
      const updatedPatientMedication = await updateMedication(
        medicationUid,
        "instructions_usage",
        value
      );

      if (setMessage && setMessageType) {
        if (updatedPatientMedication) {
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
    <TextField.Root
      defaultValue={instructions}
      maxLength={510}
      onBlur={handleBlur}
      readOnly={!drug}
    />
  );
};
