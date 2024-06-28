// Types
import { ProjectId } from "./ProjectTypes";

export type PatientPersonalId = string;

export interface PatientPersonal {
  patientPersonalId: PatientPersonalId;
  projectId: ProjectId;
  patientFullName: string;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
}
