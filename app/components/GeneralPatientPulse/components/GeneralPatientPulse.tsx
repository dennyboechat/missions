"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientPulseProps } from "../types/GeneralPatientPulseProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientPulseValid } from "../utils/isPatientPulseValid";
import { runWithRetries } from "@/app/utils/runWithRetries";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientPulse = ({
  patientGeneralId,
  patientPulse,
}: GeneralPatientPulseProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [isPulseInvalid, setIsPulseInvalid] = useState(false);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientPulse ? Number(patientPulse) : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isPulseValid = !value || isPatientPulseValid(value);
    setIsPulseInvalid(!isPulseValid);

    if (isPulseValid) {
      const codeToRun = async () => {
        const updatedPatientGeneral = await updatePatientGeneral({
          patientGeneralId,
          field: "patient_pulse",
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
      label="Pulse (in bpm)"
      value={patientPulse}
      onBlur={handleBlur}
      type="number"
      max={220}
      min={30}
      errorMessage={isPulseInvalid ? "Invalid" : ""}
      suffix="bpm"
      className={styles.text_align_right}
    />
  );
};
