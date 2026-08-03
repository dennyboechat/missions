"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";
import { UnitSwitch } from "../../ui/UnitSwitch";

// Types
import { FocusEvent } from "react";
import { GeneralPatientWeightProps } from "../types/GeneralPatientWeightProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useProjectFormats } from "../../../lib/useProjectFormats";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import {
  isPatientWeightValid,
  WEIGHT_MIN_KG,
  WEIGHT_MAX_KG,
} from "../utils/isPatientWeightValid";

// Styles
import styles from "../../../styles/fields.module.css";


export const GeneralPatientWeight = ({
  patientGeneralId,
  patientWeight,
  setPatientGeneral,
}: GeneralPatientWeightProps) => {
  const { save } = useSaveField();
  const {
    weightUnit,
    displayWeight,
    storedWeight,
    weightBounds,
  } = useProjectFormats();
  const [isWeightInvalid, setIsWeightInvalid] = useState(false);

  // The field speaks the project's unit; the column is always kilograms.
  const displayedWeight = displayWeight(patientWeight);
  const bounds = weightBounds(WEIGHT_MIN_KG, WEIGHT_MAX_KG);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const typedValue = rawValue === "" ? undefined : Number(rawValue);

    // Compared in the unit on screen: against the stored kilograms, a weight
    // shown as 141.1lb would re-save on every blur.
    if (displayedWeight === typedValue) {
      return;
    }

    const value = storedWeight(typedValue);

    // Validated in kilograms, so the same rule holds whichever unit was typed.
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

      await save(() => updatePatientGeneral({ patientGeneralId, field: "patient_weight", value, }));
    }
  };

  return (
    <InputTextField
      // Remounted when the unit changes: the number in the box is a different
      // number then, and the field is uncontrolled. Same reason as the height
      // field.
      key={weightUnit}
      label="Weight"
      labelIcon="weight"
      value={displayedWeight}
      onBlur={handleBlur}
      type="number"
      max={bounds.max}
      min={bounds.min}
      errorMessage={isWeightInvalid ? "Invalid" : ""}
      suffix={<UnitSwitch measure="weight" />}
      className={styles.text_align_right}
    />
  );
};
