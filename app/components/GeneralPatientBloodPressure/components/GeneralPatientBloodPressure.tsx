"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientBloodPressureProps } from "../types/GeneralPatientBloodPressureProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientBloodPressureSystolicValid } from "../utils/isPatientBloodPressureSystolicValid";
import { isPatientBloodPressureDiastolicValid } from "../utils/isPatientBloodPressureDiastolicValid";
import { runWithRetries } from "@/app/utils/runWithRetries";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientBloodPressure = ({
  patientGeneralId,
  patientBloodPressureSystolic,
  patientBloodPressureDiastolic,
}: GeneralPatientBloodPressureProps) => {
  const { setMessage, setMessageType } = usePopupMessage();
  const [isBloodPressureSystolicInvalid, setIsBloodPressureSystolicInvalid] =
    useState(false);
  const [isBloodPressureDiastolicInvalid, setIsBloodPressureDiastolicInvalid] =
    useState(false);

  const handleBloodPressureSystolicBlur = async (
    e: FocusEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientBloodPressureSystolic
      ? Number(patientBloodPressureSystolic)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isSystolicValid = isPatientBloodPressureSystolicValid(value);

    setIsBloodPressureSystolicInvalid(!isSystolicValid);

    if (isSystolicValid) {
      const codeToRun = async () => {
        const updatedPatientGeneral = await updatePatientGeneral({
          patientGeneralId,
          field: "patient_blood_pressure_systolic",
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

  const handleBloodPressureDiastolicBlur = async (
    e: FocusEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientBloodPressureDiastolic
      ? Number(patientBloodPressureDiastolic)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isDiastolicValid = isPatientBloodPressureDiastolicValid(value);

    setIsBloodPressureDiastolicInvalid(!isDiastolicValid);

    if (isDiastolicValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_blood_pressure_diastolic",
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
    <div>
      <div>
        <Text>{"Blood pressure (in mmHg)"}</Text>
      </div>
      <Grid columns="1fr auto 1fr" gap="3">
        <InputTextField
          value={patientBloodPressureSystolic}
          onBlur={handleBloodPressureSystolicBlur}
          type="number"
          max={250}
          min={70}
          errorMessage={isBloodPressureSystolicInvalid ? "Invalid" : ""}
          className={styles.text_align_right}
        />
        <Text>{"/"}</Text>
        <InputTextField
          value={patientBloodPressureDiastolic}
          onBlur={handleBloodPressureDiastolicBlur}
          type="number"
          max={150}
          min={40}
          suffix="mmHg"
          errorMessage={isBloodPressureDiastolicInvalid ? "Invalid" : ""}
        />
      </Grid>
    </div>
  );
};
