"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";
import { UnitSwitch } from "../../ui/UnitSwitch";

// Types
import { FocusEvent } from "react";
import { GeneralPatientHeightProps } from "../types/GeneralPatientHeightProps";
import { PatientGeneralTypes } from "@/app/types/PatientGeneralTypes";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useProjectFormats } from "../../../lib/useProjectFormats";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import {
  isPatientHeightValid,
  HEIGHT_MIN_CM,
  HEIGHT_MAX_CM,
} from "../utils/isPatientHeightValid";

// Styles
import styles from "../../../styles/fields.module.css";


export const GeneralPatientHeight = ({
  patientGeneralId,
  patientHeight,
  setPatientGeneral,
}: GeneralPatientHeightProps) => {
  const { save } = useSaveField();
  const {
    lengthUnit,
    displayLength,
    storedLength,
    lengthBounds,
  } = useProjectFormats();
  const [isHeightInvalid, setIsHeightInvalid] = useState(false);

  // The field speaks the project's unit; the column is always centimetres.
  const displayedHeight = displayLength(patientHeight);
  const bounds = lengthBounds(HEIGHT_MIN_CM, HEIGHT_MAX_CM);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const typedValue = rawValue === "" ? undefined : Number(rawValue);

    // Compared in the unit on screen, not in centimetres. Against the stored
    // figure, a height shown as 70in would re-save on every blur: 70 is not
    // 177.8, so nothing ever looked unchanged.
    if (displayedHeight === typedValue) {
      return;
    }

    const value = storedLength(typedValue);

    // Validated in centimetres, so the same rule holds whichever unit was typed.
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

      await save(() => updatePatientGeneral({ patientGeneralId, field: "patient_height", value, }));
    }
  };

  return (
    <InputTextField
      // Remounted when the unit changes, because the number in the box is a
      // different number then. The field is uncontrolled and refuses to
      // overwrite itself while focused -- and this one autofocuses -- so on the
      // first render, before the project's unit has arrived, it latched the
      // centimetre figure and then showed "178" labelled "in".
      key={lengthUnit}
      label="Height"
      labelIcon="height"
      value={displayedHeight}
      autoFocus
      onBlur={handleBlur}
      type="number"
      max={bounds.max}
      min={bounds.min}
      errorMessage={isHeightInvalid ? "Invalid" : ""}
      suffix={<UnitSwitch measure="length" />}
      className={styles.text_align_right}
    />
  );
};
