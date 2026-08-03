"use client";

// Components
import { SummaryVital } from "./SummarySection";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Utils
import { getBodyMassIndex } from "@/app/utils/getBodyMassIndex";

// Hooks
import { useProjectFormats } from "@/app/lib/useProjectFormats";

// Components
import { UnitSwitch } from "../../ui/UnitSwitch";

// Types
import { GeneralSummaryDetailsProps } from "../types/GeneralSummaryDetailsProps";

/** A pair reads as one measurement -- "118/76", "20/25" -- or as nothing. */
const pair = (first?: number, second?: number) =>
  first || second ? `${first ?? ""}/${second ?? ""}` : undefined;

export const GeneralSummaryDetails = ({
  patientHeight,
  patientWeight,
  patientTemperature,
  patientPulse,
  patientOxygenSaturation,
  patientBloodGlucose,
  patientBloodPressureSystolic,
  patientBloodPressureDiastolic,
  patientVisionLeftTestedDistance,
  patientVisionLeftNormalDistance,
  patientVisionRightTestedDistance,
  patientVisionRightNormalDistance,
}: GeneralSummaryDetailsProps) => {
  const {
    displayLength,
    displayWeight,
    displayTemperature,
  } = useProjectFormats();

  return (
  <div className={styles.vitals}>
    <SummaryVital
      icon="height"
      label="Height"
      value={displayLength(patientHeight)}
      unit={<UnitSwitch measure="length" />}
    />
    <SummaryVital
      icon="weight"
      label="Weight"
      value={displayWeight(patientWeight)}
      unit={<UnitSwitch measure="weight" />}
    />
    {/* Fed the stored kilograms and centimetres, never the displayed figures:
        the formula is kg/m2, so pounds over inches squared is not a BMI at all.
        A project on inches would have read three times too high, and one on
        pounds a little over twice. */}
    <SummaryVital
      icon="bmi"
      label="BMI"
      value={getBodyMassIndex(patientWeight, patientHeight)}
    />
    <SummaryVital
      icon="temperature"
      label="Temperature"
      value={displayTemperature(patientTemperature)}
      unit={<UnitSwitch measure="temperature" />}
    />
    <SummaryVital icon="pulse" label="Pulse" value={patientPulse} unit="bpm" />
    <SummaryVital
      icon="oxygen"
      label="Oxygen saturation"
      value={patientOxygenSaturation}
      unit="%"
    />
    <SummaryVital
      icon="glucose"
      label="Blood glucose"
      value={patientBloodGlucose}
      unit="mg/dL"
    />
    <SummaryVital
      icon="blood-pressure"
      label="Blood pressure"
      value={pair(patientBloodPressureSystolic, patientBloodPressureDiastolic)}
      unit="mmHg"
    />
    <SummaryVital
      icon="vision"
      label="Vision left"
      value={pair(patientVisionLeftNormalDistance, patientVisionLeftTestedDistance)}
      unit="feet"
    />
    <SummaryVital
      icon="vision"
      label="Vision right"
      value={pair(
        patientVisionRightNormalDistance,
        patientVisionRightTestedDistance,
      )}
      unit="feet"
    />
  </div>
  );
};
