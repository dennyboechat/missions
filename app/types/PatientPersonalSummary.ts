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
  /** Plain calendar date, YYYY-MM-DD. */
  patientDateOfBirth: string;
  patientPhoneNumber: string;
}
