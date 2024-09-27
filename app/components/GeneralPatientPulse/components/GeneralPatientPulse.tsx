"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientPulseProps } from "../types/GeneralPatientPulseProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientPulseValid } from "../utils/isPatientPulseValid";

export const GeneralPatientPulse = ({
  patientGeneralId,
  patientPulse,
}: GeneralPatientPulseProps) => {
  const { setMessage } = usePopupMessage();
  const [isPulseInvalid, setIsPulseInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientPulse
      ? Number(patientPulse)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isPulseValid = !value || isPatientPulseValid(value);
    setIsPulseInvalid(!isPulseValid);

    if (isPulseValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_pulse",
        value,
      });

      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <InputTextField
      label="Pulse (in bpm)"
      value={patientPulse}
      onBlur={handleBlur}
      type="number"
      max={220}
      min={30}
      errorMessage={isPulseInvalid ? "Invalid" : ""}
      suffix="bpm"
    />
  );
};
