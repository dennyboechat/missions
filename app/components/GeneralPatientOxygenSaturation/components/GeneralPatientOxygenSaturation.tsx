"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientOxygenSaturationProps } from "../types/GeneralPatientOxygenSaturationProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientOxygenSaturationValid } from "../utils/isPatientOxygenSaturationValid";

export const GeneralPatientOxygenSaturation = ({
  patientGeneralId,
  patientOxygenSaturation,
}: GeneralPatientOxygenSaturationProps) => {
  const { setMessage } = usePopupMessage();
  const [isOxygenSaturationInvalid, setIsOxygenSaturationInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientOxygenSaturation
      ? Number(patientOxygenSaturation)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isOxygenSaturationValid = !value || isPatientOxygenSaturationValid(value);
    setIsOxygenSaturationInvalid(!isOxygenSaturationValid);

    if (isOxygenSaturationValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_oxygen_saturation",
        value,
      });

      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <InputTextField
      label="Oxygen saturation (in %)"
      value={patientOxygenSaturation}
      onBlur={handleBlur}
      type="number"
      max={100}
      min={70}
      errorMessage={isOxygenSaturationInvalid ? "Invalid" : ""}
      suffix="%"
    />
  );
};
