// Types
import { PatientPersonalId } from "./PatientPersonalTypes";
import { ProjectId } from "./ProjectTypes";
import { PatientPersonalFullName } from "./PatientPersonalTypes";

export type PatientDentistryId = string;

export interface PatientDental {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  /** Calendar day in the project's timezone, YYYY-MM-DD. */
  appointmentDate: string;
  appointmentNotes: string;
  appointmentReferral: string;
}

export interface PatientDentistryTypes {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  /** Calendar day in the project's timezone, YYYY-MM-DD. */
  appointmentDate: string;
  appointmentNotes: string;
  appointmentHasReferral: boolean;
  appointmentReferral: string;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  /** Plain calendar date, YYYY-MM-DD. */
  patientDateOfBirth: string;
}

export interface UpdatePatientDentistry {
  patientDentistryId: PatientDentistryId;
  field: string;
  value: string | boolean;
}
