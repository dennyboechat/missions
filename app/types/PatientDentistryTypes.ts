// Types
import { PatientPersonalId } from "./PatientPersonalTypes";

export type PatientDentistryId = string;

export interface PatientDentistryTypes {
  patientDentistryId: PatientDentistryId;
  patientPersonalId: PatientPersonalId;
  appointmentNotes: string;
  appointmentDate: string;
  isChildDentalMap: boolean;
}
