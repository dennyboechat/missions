"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { QuantityProps } from "../types/QuantityProps";
import { Medication } from "../../../../types/Medication";
import { FocusEvent } from "react";

// Database
import { updatePatientDentistryMedication } from "../../../../database/patient-dentistry-medication/updatePatientDentistryMedication";

// Hooks
import { usePopupMessage } from "../../../../lib/PopupMessage";

export const QuantityInput = ({
  drug,
  quantity,
  medicationUid,
  setMedications,
}: QuantityProps) => {
  const { setMessage } = usePopupMessage();

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

    const updatedPatientMedication = await updatePatientDentistryMedication({
      patientDentistryPrescribedMedicationId: medicationUid,
      field: "quantity",
      value,
    });

    if (updatedPatientMedication && setMessage) {
      setMessage("Saved");
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
