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

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientOxygenSaturation = ({
  patientGeneralId,
  patientOxygenSaturation,
}: GeneralPatientOxygenSaturationProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
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
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_oxygen_saturation",
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
