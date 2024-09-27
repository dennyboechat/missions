"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientHeightProps } from "../types/GeneralPatientHeightProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientHeightValid } from "../utils/isPatientHeightValid";

export const GeneralPatientHeight = ({
  patientGeneralId,
  patientHeight,
}: GeneralPatientHeightProps) => {
  const { setMessage } = usePopupMessage();
  const [isHeightInvalid, setIsHeightInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientHeight ? Number(patientHeight) : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isHeightValid = !value || isPatientHeightValid(value);
    setIsHeightInvalid(!isHeightValid);

    if (isHeightValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_height",
        value,
      });

      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <InputTextField
      label="Height (in cm)"
      value={patientHeight}
      autoFocus
      onBlur={handleBlur}
      type="number"
      max={220}
      min={0}
      errorMessage={isHeightInvalid ? "Invalid" : ""}
      suffix="cm"
    />
  );
};
