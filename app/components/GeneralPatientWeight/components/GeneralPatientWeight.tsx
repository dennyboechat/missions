"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientWeightProps } from "../types/GeneralPatientWeightProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientWeightValid } from "../utils/isPatientWeightValid";
import { runWithRetries } from "@/app/utils/runWithRetries";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientWeight = ({
  patientGeneralId,
  patientWeight,
  setPatientGeneral,
}: GeneralPatientWeightProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [isWeightInvalid, setIsWeightInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientWeight ? Number(patientWeight) : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isWeightValid = !value || isPatientWeightValid(value);
    setIsWeightInvalid(!isWeightValid);

    if (isWeightValid) {
      setPatientGeneral((prevState: PatientGeneralTypes[] | undefined) =>
        prevState?.map((existingPatientGeneral) =>
          existingPatientGeneral.patientGeneralId === patientGeneralId
            ? { ...existingPatientGeneral, patientWeight: value }
            : existingPatientGeneral
        )
      );

      const codeToRun = async () => {
        const updatedPatientGeneral = await updatePatientGeneral({
          patientGeneralId,
          field: "patient_weight",
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
      label="Weight (in kg)"
      value={patientWeight}
      onBlur={handleBlur}
      type="number"
      max={180}
      min={0}
      errorMessage={isWeightInvalid ? "Invalid" : ""}
      suffix="kg"
      className={styles.text_align_right}
    />
  );
};
