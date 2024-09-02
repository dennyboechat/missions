"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { DoseProps } from "../types/DoseProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Database
import { updatePatientDentistryMedication } from "../../../../database/patient-dentistry-medication/updatePatientDentistryMedication";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

export const DoseInput = ({
  drug,
  dose,
  medicationUid,
  setMedications,
}: DoseProps) => {
  const { setMessage } = usePopupMessage();

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

    const updatedPatientMedication = await updatePatientDentistryMedication({
      patientDentistryPrescribedMedicationId: medicationUid,
      field: "dose",
      value,
    });

    if (updatedPatientMedication && setMessage) {
      setMessage("Saved");
    }
  };

  return <TextField.Root defaultValue={dose} maxLength={255} onBlur={handleBlur} readOnly={!drug} />;
};
