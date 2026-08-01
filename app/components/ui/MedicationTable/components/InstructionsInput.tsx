"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { InstructionsProps } from "../types/InstructionsProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Hooks
import { useSaveField } from "../../../../lib/useSaveField";

// Utils

export const InstructionsInput = ({
  drug,
  instructions,
  medicationUid,
  setMedications,
  updateMedication,
}: InstructionsProps) => {
  const { save } = useSaveField();

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

    await save(() => updateMedication( medicationUid, "instructions_usage", value ));
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
