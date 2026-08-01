// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Tooth } from "./Tooth";
import { Medication } from "./Medication";

export interface PatientDentalAppointmentSummary {
  patientDentistryId: PatientDentistryId;
  /** Calendar day in the project's timezone, YYYY-MM-DD. */
  appointmentDate: string;
  appointmentHasReferral: boolean;
  appointmentReferral: string;
  treatedTeeth: (Tooth | undefined)[];
  extractedTeeth: (Tooth | undefined)[];
  prescribedMedication: Medication[];
}
