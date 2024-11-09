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
  appointmentReferral: string;
}

export interface PatientDentistryTypes {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  appointmentDate: Date;
  appointmentNotes: string;
  appointmentReferral: string;
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
  isPatientMale: boolean;
  patientDateOfBirth: Date;
}

export interface UpdatePatientDentistry {
  patientDentistryId: PatientDentistryId;
  field: string;
  value: string | boolean;
}
