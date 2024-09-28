"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";

// Types
import { FocusEvent } from "react";
import { GeneralPatientVisionRightProps } from "../types/GeneralPatientVisionRightProps";

// Hooks
import { usePopupMessage } from "../../../lib/PopupMessage";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import { isPatientVisionRightNormalDistanceValid } from "../utils/isPatientVisionRightNormalDistanceValid";
import { isPatientVisionRightTestedDistanceValid } from "../utils/isPatientVisionRightTestedDistanceValid";

// Styles
import styles from "../../../styles/fields.module.css";

export const GeneralPatientVisionRight = ({
  patientGeneralId,
  patientVisionRightNormalDistance,
  patientVisionRightTestedDistance,
}: GeneralPatientVisionRightProps) => {
  const { setMessage } = usePopupMessage();
  const [
    isVisionRightNormalDistanceInvalid,
    setIsVisionRightNormalDistanceInvalid,
  ] = useState(false);
  const [
    isVisionRightTestedDistanceInvalid,
    setIsVisionRightTestedDistanceInvalid,
  ] = useState(false);

  const handleVisionRightNormalDistanceBlur = async (
    e: FocusEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientVisionRightNormalDistance
      ? Number(patientVisionRightNormalDistance)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isNormalDistanceValid =
      isPatientVisionRightNormalDistanceValid(value);

    setIsVisionRightNormalDistanceInvalid(!isNormalDistanceValid);

    if (isNormalDistanceValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_vision_right_normal_distance",
        value,
      });
      if (updatedPatientGeneral && setMessage) {
        setMessage("Saved");
      }
    }
  };

  const handleVisionRightTestedDistanceBlur = async (
    e: FocusEvent<HTMLInputElement>
  ) => {
    const rawValue = e.target.value;
    const value = rawValue === "" ? undefined : Number(rawValue);
    const previousQuantity = patientVisionRightTestedDistance
      ? Number(patientVisionRightTestedDistance)
      : undefined;

    if (previousQuantity === value) {
      return;
    }

    const isTestedDistanceValid =
      isPatientVisionRightTestedDistanceValid(value);

    setIsVisionRightTestedDistanceInvalid(!isTestedDistanceValid);

    if (isTestedDistanceValid) {
      const updatedPatientGeneral = await updatePatientGeneral({
        patientGeneralId,
        field: "patient_vision_right_tested_distance",
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
        <Text>{"Vision right (in feet)"}</Text>
      </div>
      <Grid columns="1fr auto 1fr" gap="3">
        <InputTextField
          value={patientVisionRightNormalDistance}
          onBlur={handleVisionRightNormalDistanceBlur}
          type="number"
          max={20}
          min={10}
          errorMessage={isVisionRightNormalDistanceInvalid ? "Invalid" : ""}
          className={styles.text_align_right}
        />
        <Text>{"/"}</Text>
        <InputTextField
          value={patientVisionRightTestedDistance}
          onBlur={handleVisionRightTestedDistanceBlur}
          type="number"
          max={400}
          min={10}
          suffix="feet"
          errorMessage={isVisionRightTestedDistanceInvalid ? "Invalid" : ""}
        />
      </Grid>
    </div>
  );
};
