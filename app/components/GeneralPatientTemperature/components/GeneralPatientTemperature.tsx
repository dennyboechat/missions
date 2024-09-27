"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientTemperatureProps } from "../types/GeneralPatientTemperatureProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientTemperatureValid } from "../utils/isPatientTemperatureValid";

export const GeneralPatientTemperature = ({
  patientGeneralId,
  patientTemperature,
}: GeneralPatientTemperatureProps) => {
  const { setMessage } = usePopupMessage();
  const [isTemperatureInvalid, setIsTemperatureInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientTemperature
      ? Number(patientTemperature)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isTemperatureValid = !value || isPatientTemperatureValid(value);
    setIsTemperatureInvalid(!isTemperatureValid);

    if (isTemperatureValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_temperature",
        value,
      });

      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <InputTextField
      label="Temperature (in °C)"
      value={patientTemperature}
      onBlur={handleBlur}
      type="number"
      max={44}
      min={34}
      errorMessage={isTemperatureInvalid ? "Invalid" : ""}
      suffix="°C"
    />
  );
};
