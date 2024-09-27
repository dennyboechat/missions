"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientWeightProps } from "../types/GeneralPatientWeightProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientWeightValid } from "../utils/isPatientWeightValid";

export const GeneralPatientWeight = ({
  patientGeneralId,
  patientWeight,
}: GeneralPatientWeightProps) => {
  const { setMessage } = usePopupMessage();
  const [isWeightInvalid, setIsWeightInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientWeight ? Number(patientWeight) : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isWeightValid = value && isPatientWeightValid(value);
    setIsWeightInvalid(!isWeightValid);

    if (isWeightValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_weight",
        value,
      });

      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <InputTextField
      label="Patient weight (in kg)"
      value={patientWeight}
      onBlur={handleBlur}
      type="number"
      placeholder="60"
      max={180}
      min={0}
      errorMessage={isWeightInvalid ? "Invalid" : ""}
    />
  );
};
