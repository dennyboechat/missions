// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Tooth } from "./Tooth";
import { Medication } from "./Medication";

export interface PatientDentalAppointmentSummary {
  patientDentistryId: PatientDentistryId;
  appointmentDate: Date;
  appointmentHasReferral: boolean;
  appointmentReferral: string;
  treatedTeeth: (Tooth | undefined)[];
  extractedTeeth: (Tooth | undefined)[];
  prescribedMedication: Medication[];
}
