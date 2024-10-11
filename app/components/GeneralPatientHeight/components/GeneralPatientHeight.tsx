"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientHeightProps } from "../types/GeneralPatientHeightProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientHeightValid } from "../utils/isPatientHeightValid";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientHeight = ({
  patientGeneralId,
  patientHeight,
  setPatientGeneral,
}: GeneralPatientHeightProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
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
      setPatientGeneral((prevState: PatientGeneralTypes[] | undefined) =>
        prevState?.map((existingPatientGeneral) =>
          existingPatientGeneral.patientGeneralId === patientGeneralId
            ? { ...existingPatientGeneral, patientHeight: value }
            : existingPatientGeneral
        )
      );

      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_height",
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
      className={styles.text_align_right}
    />
  );
};
