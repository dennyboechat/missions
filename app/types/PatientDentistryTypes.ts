// Types
import { PatientPersonalId } from "./PatientPersonalTypes";
import { ProjectId } from "./ProjectTypes";
import { PatientPersonalFullName } from "./PatientPersonalTypes";

export type PatientDentistryId = string;

export interface PatientDentistryTypes {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  appointmentNotes: string;
  appointmentDate: string;
  isChildDentalMap: boolean;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
}
