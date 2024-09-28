"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientVisionLeftProps } from "../types/GeneralPatientVisionLeftProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientVisionLeftNormalDistanceValid } from "../utils/isPatientVisionLeftNormalDistanceValid";
import { isPatientVisionLeftTestedDistanceValid } from "../utils/isPatientVisionLeftTestedDistanceValid";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientVisionLeft = ({
  patientGeneralId,
  patientVisionLeftNormalDistance,
  patientVisionLeftTestedDistance,
}: GeneralPatientVisionLeftProps) => {
  const { setMessage } = usePopupMessage();
  const [
    isVisionLeftNormalDistanceInvalid,
    setIsVisionLeftNormalDistanceInvalid,
  ] = useState(false);
  const [
    isVisionLeftTestedDistanceInvalid,
    setIsVisionLeftTestedDistanceInvalid,
  ] = useState(false);

  const handleVisionLeftNormalDistanceBlur = async (
    e: FocusEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientVisionLeftNormalDistance
      ? Number(patientVisionLeftNormalDistance)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isNormalDistanceValid = isPatientVisionLeftNormalDistanceValid(value);

    setIsVisionLeftNormalDistanceInvalid(!isNormalDistanceValid);

    if (isNormalDistanceValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_vision_left_normal_distance",
        value,
      });
      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  const handleVisionLeftTestedDistanceBlur = async (
    e: FocusEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientVisionLeftTestedDistance
      ? Number(patientVisionLeftTestedDistance)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isTestedDistanceValid = isPatientVisionLeftTestedDistanceValid(value);

    setIsVisionLeftTestedDistanceInvalid(!isTestedDistanceValid);

    if (isTestedDistanceValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_vision_left_tested_distance",
        value,
      });
      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  return (
    <div>
      <div>
        <Text>{"Vision left (in feet)"}</Text>
      </div>
      <Grid columns="1fr auto 1fr" gap="3">
        <InputTextField
          value={patientVisionLeftNormalDistance}
          onBlur={handleVisionLeftNormalDistanceBlur}
          type="number"
          max={20}
          min={10}
          errorMessage={isVisionLeftNormalDistanceInvalid ? "Invalid" : ""}
          className={styles.text_align_right}
        />
        <Text>{"/"}</Text>
        <InputTextField
          value={patientVisionLeftTestedDistance}
          onBlur={handleVisionLeftTestedDistanceBlur}
          type="number"
          max={400}
          min={10}
          suffix="feet"
          errorMessage={isVisionLeftTestedDistanceInvalid ? "Invalid" : ""}
        />
      </Grid>
    </div>
  );
};
