// Types
import { ProjectId } from "./ProjectTypes";

export type PatientPersonalId = string;

export type PatientPersonalFullName = string;

export interface PatientPersonalTypes {
  patientPersonalId: PatientPersonalId;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
  patientPhoneNumber: string;
  filterOrder?: number;
}

export interface NewPatientPersonal {
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
  patientPhoneNumber?: string;
}

export interface UpdatePatientPersonal {
  patientPersonalId: PatientPersonalId;
  field: string;
  value: string | boolean;
}

export interface FilteredPatientPersonal extends PatientPersonalTypes {
  filterOrder: number;
}
