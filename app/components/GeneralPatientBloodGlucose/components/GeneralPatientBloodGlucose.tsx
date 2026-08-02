"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientBloodGlucoseProps } from "../types/GeneralPatientBloodGlucoseProps";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientBloodGlucoseValid } from "../utils/isPatientBloodGlucoseValid";

// Styles
import styles from "../../../styles/fields.module.css";


export const GeneralPatientBloodGlucose = ({
  patientGeneralId,
  patientBloodGlucose,
}: GeneralPatientBloodGlucoseProps) => {
  const { save } = useSaveField();
  const [isBloodGlucoseInvalid, setIsBloodGlucoseInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientBloodGlucose
      ? Number(patientBloodGlucose)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isBloodGlucoseValid = !value || isPatientBloodGlucoseValid(value);
    setIsBloodGlucoseInvalid(!isBloodGlucoseValid);

    if (isBloodGlucoseValid) {
      await save(() => updatePatientGeneral({ patientGeneralId, field: "patient_blood_glucose", value, }));
    }
  };

  return (
    <InputTextField
      label="Blood glucose"
      labelIcon="glucose"
      value={patientBloodGlucose}
      onBlur={handleBlur}
      type="number"
      max={600}
      min={40}
      errorMessage={isBloodGlucoseInvalid ? "Invalid" : ""}
      suffix="mg/dL"
      className={styles.text_align_right}
    />
  );
};
