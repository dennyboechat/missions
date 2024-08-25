"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { DoseProps } from "../types/DoseProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

export const DoseInput = ({ medicationUid, setMedications }: DoseProps) => {
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.uid === medicationUid
          ? { ...medication, dose: value }
          : medication
      )
    );
  };

  return <TextField.Root maxLength={255} onBlur={handleBlur} />;
};
