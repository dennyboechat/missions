// Types
import { PatientPersonalId } from "./PatientPersonalTypes";
import { ProjectId } from "./ProjectTypes";
import { PatientPersonalFullName } from "./PatientPersonalTypes";

export type PatientGeneralId = string;

export interface PatientGeneralTypes {
  patientGeneralId: PatientGeneralId;
  patientPersonalId: PatientPersonalId;
  appointmentDate: Date;
  appointmentNotes: string;
  appointmentHasReferral: boolean;
  appointmentReferral: string;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
  patientHeight?: number;
  patientWeight?: number;
  patientTemperature?: number;
  patientBloodGlucose?: number;
  patientPulse?: number;
  patientOxygenSaturation?: number;
  patientBloodPressureSystolic?: number;
  patientBloodPressureDiastolic?: number;
  patientVisionLeftTestedDistance?: number;
  patientVisionLeftNormalDistance?: number;
  patientVisionRightTestedDistance?: number;
  patientVisionRightNormalDistance?: number;
}

export interface PatientGeneral {
  patientGeneralId: PatientGeneralId;
  patientPersonalId: PatientPersonalId;
  appointmentDate: Date;
  appointmentNotes: string;
}

export interface UpdatePatientGeneral {
  patientGeneralId: PatientGeneralId;
  field: string;
  value?: string | number | boolean;
}
