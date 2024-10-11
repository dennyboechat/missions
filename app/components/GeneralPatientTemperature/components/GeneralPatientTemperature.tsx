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
import { runWithRetries } from "@/app/utils/runWithRetries";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientTemperature = ({
  patientGeneralId,
  patientTemperature,
}: GeneralPatientTemperatureProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
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
      const codeToRun = async () => {
        const updatedPatientGeneral = await updatePatientGeneral({
          patientGeneralId,
          field: "patient_temperature",
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
      label="Temperature (in °C)"
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
