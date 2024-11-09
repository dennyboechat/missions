// Types
import { PatientGeneralId } from "./PatientGeneralTypes";
import { Medication } from "./Medication";

export interface PatientGeneralAppointmentSummary {
  patientGeneralId: PatientGeneralId;
  appointmentDate: Date;
  patientHeight: number;
  patientWeight: number;
  patientTemperature: number;
  patientPulse: number;
  patientOxygenSaturation: number;
  patientBloodGlucose: number;
  patientBloodPressureSystolic: number;
  patientBloodPressureDiastolic: number;
  patientVisionLeftTestedDistance: number;
  patientVisionLeftNormalDistance: number;
  patientVisionRightTestedDistance: number;
  patientVisionRightNormalDistance: number;
  appointmentReferral: string;
  prescribedMedication: Medication[];
}
