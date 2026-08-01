"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientOxygenSaturationProps } from "../types/GeneralPatientOxygenSaturationProps";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientOxygenSaturationValid } from "../utils/isPatientOxygenSaturationValid";

// Styles
import styles from "../../../styles/fields.module.css";


export const GeneralPatientOxygenSaturation = ({
  patientGeneralId,
  patientOxygenSaturation,
}: GeneralPatientOxygenSaturationProps) => {
  const { save } = useSaveField();
  const [isOxygenSaturationInvalid, setIsOxygenSaturationInvalid] =
    useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientOxygenSaturation
      ? Number(patientOxygenSaturation)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isOxygenSaturationValid =
      !value || isPatientOxygenSaturationValid(value);
    setIsOxygenSaturationInvalid(!isOxygenSaturationValid);

    if (isOxygenSaturationValid) {
      await save(() => updatePatientGeneral({ patientGeneralId, field: "patient_oxygen_saturation", value, }));
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
      className={styles.text_align_right}
    />
  );
};
