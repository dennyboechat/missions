"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientBloodGlucoseProps } from "../types/GeneralPatientBloodGlucoseProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientBloodGlucoseValid } from "../utils/isPatientBloodGlucoseValid";
import { runWithRetries } from "@/app/utils/runWithRetries";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientBloodGlucose = ({
  patientGeneralId,
  patientBloodGlucose,
}: GeneralPatientBloodGlucoseProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
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
      const codeToRun = async () => {
        const updatedPatientGeneral = await updatePatientGeneral({
          patientGeneralId,
          field: "patient_blood_glucose",
          value,
        });

        if (setMessage && setMessageType) {
          if (updatedPatientGeneral) {
            setMessage("Saved");
            setMessageType("regular");
          } else {
            setMessage("Error to save. Please try again.");
            setMessageType("error");
          }
        }
      };

      const runSuccess = await runWithRetries(codeToRun);
      if (!runSuccess && setMessage && setMessageType) {
        setMessage("Error to save. Please try again.");
        setMessageType("error");
      }
    }
  };

  return (
    <InputTextField
      label="Blood glucose (in mg/dL)"
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
