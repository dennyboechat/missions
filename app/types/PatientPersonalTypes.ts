// Types
import { ProjectId } from "./ProjectTypes";

export type PatientPersonalId = string;

export type PatientPersonalFullName = string;

export interface PatientPersonal {
  patientPersonalId: PatientPersonalId;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
}

export interface UpdatePatientPersonal {
  patientPersonalId: PatientPersonalId;
  field: string;
  value: string;
}
