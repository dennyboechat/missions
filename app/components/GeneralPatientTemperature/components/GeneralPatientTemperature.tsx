"use client";

// Components
import { InputTextField } from "../../ui/InputTextField";
import { UnitSwitch } from "../../ui/UnitSwitch";

// Types
import { FocusEvent } from "react";
import { GeneralPatientTemperatureProps } from "../types/GeneralPatientTemperatureProps";

// Hooks
import { useSaveField } from "../../../lib/useSaveField";
import { useProjectFormats } from "../../../lib/useProjectFormats";
import { useState } from "react";

// Database
import { updatePatientGeneral } from "../../../database/patient-general/UpdatePatientGeneral";

// Utils
import {
  isPatientTemperatureValid,
  TEMPERATURE_MIN_C,
  TEMPERATURE_MAX_C,
} from "../utils/isPatientTemperatureValid";

// Styles
import styles from "../../../styles/fields.module.css";


export const GeneralPatientTemperature = ({
  patientGeneralId,
  patientTemperature,
}: GeneralPatientTemperatureProps) => {
  const { save } = useSaveField();
  const {
    temperatureUnit,
    displayTemperature,
    storedTemperature,
    temperatureBounds,
  } = useProjectFormats();
  const [isTemperatureInvalid, setIsTemperatureInvalid] = useState(false);

  // The field speaks the project's unit; the column is always Celsius.
  const displayedTemperature = displayTemperature(patientTemperature);
  const bounds = temperatureBounds(TEMPERATURE_MIN_C, TEMPERATURE_MAX_C);

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const typedValue = rawValue === "" ? undefined : Number(rawValue);

    // Compared in the unit on screen: against the stored Celsius, a reading
    // shown as 98.6°F would re-save on every blur.
    if (displayedTemperature === typedValue) {
      return;
    }

    const value = storedTemperature(typedValue);

    // Validated in Celsius, so the same rule holds whichever unit was typed.
    const isTemperatureValid = !value || isPatientTemperatureValid(value);
    setIsTemperatureInvalid(!isTemperatureValid);

    if (isTemperatureValid) {
      await save(() => updatePatientGeneral({ patientGeneralId, field: "patient_temperature", value, }));
    }
  };

  return (
    <InputTextField
      // Same reason as the height field: the number in the box changes meaning
      // with the unit, so the unit belongs to the field's identity.
      key={temperatureUnit}
      label="Temperature"
      labelIcon="temperature"
      value={displayedTemperature}
      onBlur={handleBlur}
      type="number"
      max={bounds.max}
      min={bounds.min}
      errorMessage={isTemperatureInvalid ? "Invalid" : ""}
      suffix={<UnitSwitch measure="temperature" />}
      className={styles.text_align_right}
    />
  );
};
