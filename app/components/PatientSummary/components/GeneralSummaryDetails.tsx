"use client";

// Components
import { Text } from "@radix-ui/themes";
import { Space } from "../../ui/Space";

// Styles
import styles from "../styles/PatientSummary.module.css";

// Utils
import { getBodyMassIndex } from "@/app/utils/getBodyMassIndex";

// Types
import { GeneralSummaryDetailsProps } from "../types/GeneralSummaryDetailsProps";

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
  const undefinedText = <Text className={styles.italic}>{"undefined"}</Text>;
  const bmi = getBodyMassIndex(patientWeight, patientHeight);

  return (
    <div>
      <div className={styles.summary_margin}>
        <Text>{`Height: ${patientHeight ? patientHeight + " cm" : ""}`}</Text>
        {!patientHeight && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Weight: ${patientWeight ? patientWeight + " kg" : ""}`}</Text>
        {!patientWeight && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`BMI: ${bmi ? bmi : ""}`}</Text>
        {!bmi && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Temperature: ${
          patientTemperature ? patientTemperature + " °C" : ""
        }`}</Text>
        {!patientTemperature && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Pulse: ${patientPulse ? patientPulse + " bpm" : ""}`}</Text>
        {!patientPulse && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Oxygen saturation: ${
          patientOxygenSaturation ? patientOxygenSaturation + "%" : ""
        }`}</Text>
        {!patientOxygenSaturation && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Blood glucose: ${
          patientBloodGlucose ? patientBloodGlucose + " mg/dL" : ""
        }`}</Text>
        {!patientBloodGlucose && undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Blood pressure: ${
          patientBloodPressureSystolic || patientBloodPressureDiastolic
            ? `${patientBloodPressureSystolic ?? ""}/${
                patientBloodPressureDiastolic ?? " "
              } mmHg`
            : ""
        }`}</Text>
        {!patientBloodPressureSystolic &&
          !patientBloodPressureDiastolic &&
          undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Vision left: ${
          patientVisionLeftNormalDistance || patientVisionLeftTestedDistance
            ? `${patientVisionLeftNormalDistance ?? ""}/${
                patientVisionLeftTestedDistance ?? " "
              } feet`
            : ""
        }`}</Text>
        {!patientVisionLeftNormalDistance &&
          !patientVisionLeftTestedDistance &&
          undefinedText}
      </div>
      <Space />
      <div className={styles.summary_margin}>
        <Text>{`Vision right: ${
          patientVisionRightNormalDistance || patientVisionRightTestedDistance
            ? `${patientVisionRightNormalDistance ?? ""}/${
                patientVisionRightTestedDistance ?? " "
              } feet`
            : ""
        }`}</Text>
        {!patientVisionRightNormalDistance &&
          !patientVisionRightTestedDistance &&
          undefinedText}
      </div>
    </div>
  );
};
