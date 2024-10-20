// Types
import {
  PatientPersonalId,
  PatientPersonalFullName,
} from "./PatientPersonalTypes";
import { ProjectId } from "./ProjectTypes";

export interface PatientPersonalSummary {
  patientPersonalId: PatientPersonalId;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
  patientPhoneNumber: string;
}
