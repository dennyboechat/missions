"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { DoseProps } from "../types/DoseProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Hooks
import { useSaveField } from "../../../../lib/useSaveField";

// Utils

export const DoseInput = ({
  drug,
  dose,
  medicationUid,
  setMedications,
  updateMedication,
}: DoseProps) => {
  const { save } = useSaveField();

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

    await save(() => updateMedication( medicationUid, "dose", value ));
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
