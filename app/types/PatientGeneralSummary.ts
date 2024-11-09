// Types
import { PatientGeneralId } from "./PatientGeneralTypes";
import { Drug, Dose, Instructions } from "./Medication";
import { PatientGeneralPrescribedMedicationId } from "./GeneralPrescribedMedication";

export interface PatientGeneralSummary {
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
  patientGeneralPrescribedMedicationId: PatientGeneralPrescribedMedicationId;
  drug: Drug;
  dose: Dose;
  quantity: number;
  instructions: Instructions;
}
