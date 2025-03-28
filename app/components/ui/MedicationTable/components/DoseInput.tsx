"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { DoseProps } from "../types/DoseProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const DoseInput = ({
  drug,
  dose,
  medicationUid,
  setMedications,
  updateMedication,
}: DoseProps) => {
  const { setMessage, setMessageType } = usePopupMessage();

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!drug || !medicationUid || dose === value) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.medicationUid === medicationUid
          ? { ...medication, dose: value }
          : medication
      )
    );

    const codeToRun = async () => {
      const updatedPatientMedication = await updateMedication(
        medicationUid,
        "dose",
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
      defaultValue={dose}
      maxLength={255}
      onBlur={handleBlur}
      readOnly={!drug}
    />
  );
};
