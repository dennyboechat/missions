"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { InstructionsProps } from "../types/InstructionsProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

export const InstructionsInput = ({
  medicationUid,
  setMedications,
}: InstructionsProps) => {
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.uid === medicationUid
          ? { ...medication, instructions: value }
          : medication
      )
    );
  };

  return <TextField.Root maxLength={510} onBlur={handleBlur} />;
};
