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
  filterOrder?: number;
}

export interface UpdatePatientPersonal {
  patientPersonalId: PatientPersonalId;
  field: string;
  value: string | boolean;
}

export interface FilteredPatientPersonal extends PatientPersonalTypes {
  filterOrder: number;
}
