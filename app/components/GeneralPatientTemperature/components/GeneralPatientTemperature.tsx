"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientTemperatureProps } from "../types/GeneralPatientTemperatureProps";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientTemperatureValid } from "../utils/isPatientTemperatureValid";

// Styles
import styles from "../../../styles/fields.module.css";


export const GeneralPatientTemperature = ({
  patientGeneralId,
  patientTemperature,
}: GeneralPatientTemperatureProps) => {
  const { save } = useSaveField();
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
      await save(() => updatePatientGeneral({ patientGeneralId, field: "patient_temperature", value, }));
    }
  };

  return (
    <InputTextField
      label="Temperature"
      labelIcon="temperature"
      value={patientTemperature}
      onBlur={handleBlur}
      type="number"
      max={44}
      min={34}
      errorMessage={isTemperatureInvalid ? "Invalid" : ""}
      suffix="°C"
      className={styles.text_align_right}
    />
  );
};
