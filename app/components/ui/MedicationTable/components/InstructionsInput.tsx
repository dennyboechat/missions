"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { InstructionsProps } from "../types/InstructionsProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Database
import { updatePatientDentistryMedication } from "../../../../database/patient-dentistry-medication/UpdatePatientDentistryMedication";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

export const InstructionsInput = ({
  drug,
  instructions,
  medicationUid,
  setMedications,
}: InstructionsProps) => {
  const { setMessage } = usePopupMessage();

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

    const updatedPatientMedication = await updatePatientDentistryMedication({
      patientDentistryPrescribedMedicationId: medicationUid,
      field: "instructions_usage",
      value,
    });

    if (updatedPatientMedication && setMessage) {
      setMessage("Saved");
    }
  };

  return (
    <TextField.Root defaultValue={instructions} maxLength={510} onBlur={handleBlur} readOnly={!drug} />
  );
};
