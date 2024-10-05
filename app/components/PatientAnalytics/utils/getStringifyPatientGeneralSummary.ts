//Types
import { PatientPersonalSummary } from "../../../types/PatientPersonalSummary";
import { PatientGeneralSummary } from "../../../types/PatientGeneralSummary";

export const getStringifyPatientGeneralSummary = (
  patientPersonalSummary: PatientPersonalSummary,
  patientGeneralSummary: PatientGeneralSummary
) => {
  const { isPatientMale, patientDateOfBirth } = patientPersonalSummary;

  const {
    patientHeight,
    patientWeight,
    patientTemperature,
    patientPulse,
    patientOxygenSaturation,
    patientBloodGlucose,
    patientBloodPressureDiastolic,
    patientBloodPressureSystolic,
    patientVisionLeftNormalDistance,
    patientVisionLeftTestedDistance,
    patientVisionRightNormalDistance,
    patientVisionRightTestedDistance,
  } = patientGeneralSummary;

  return `DoB ${patientDateOfBirth} IsMale ${isPatientMale} Height ${patientHeight}cm Weight ${patientWeight}kg Temperature ${patientTemperature}C Pulse ${patientPulse}bpm Oxygen saturation ${patientOxygenSaturation}% Blood glucose ${patientBloodGlucose}mg/dL Blood pressure ${patientBloodPressureSystolic}/${patientBloodPressureDiastolic} Vision left ${patientVisionLeftNormalDistance}/${patientVisionLeftTestedDistance} Vision right ${patientVisionRightNormalDistance}/${patientVisionRightTestedDistance}`;
};
