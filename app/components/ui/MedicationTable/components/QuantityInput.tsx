"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { QuantityProps } from "../types/QuantityProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

export const QuantityInput = ({
  medicationUid,
  setMedications,
}: QuantityProps) => {
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setMedications((prevMedications: Medication[]) =>
      prevMedications.map((medication) =>
        medication.uid === medicationUid
          ? { ...medication, quantity: value }
          : medication
      )
    );
  };

  return <TextField.Root type="number" maxLength={20} onBlur={handleBlur} />;
};
