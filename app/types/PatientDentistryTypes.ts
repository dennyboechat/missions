// Types
import { PatientPersonalId } from "./PatientPersonalTypes";
import { ProjectId } from "./ProjectTypes";
import { PatientPersonalFullName } from "./PatientPersonalTypes";

export type PatientDentistryId = string;

export interface PatientDental {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  appointmentDate: Date;
  appointmentNotes: string;
}

export interface PatientDentistryTypes {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  appointmentDate: Date;
  appointmentNotes: string;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
}
