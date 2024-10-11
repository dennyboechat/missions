"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { QuantityProps } from "../types/QuantityProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

// Utils
import { runWithRetries } from "@/app/utils/runWithRetries";

export const QuantityInput = ({
  drug,
  quantity,
  medicationUid,
  setMedications,
  updateMedication,
}: QuantityProps) => {
  const { setMessage, setMessageType } = usePopupMessage();

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = quantity ? Number(quantity) : undefined;

    if (!drug || !medicationUid || previousQuantity === value) {
      return;
    }

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.medicationUid === medicationUid
          ? { ...medication, quantity: value }
          : medication
      )
    );

    const codeToRun = async () => {
      const updatedPatientMedication = await updateMedication(
        medicationUid,
        "quantity",
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
      defaultValue={quantity}
      type="number"
      maxLength={20}
      onBlur={handleBlur}
      readOnly={!drug}
    />
  );
};
