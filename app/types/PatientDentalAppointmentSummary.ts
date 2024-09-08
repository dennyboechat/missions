// Types
import { PatientDentistryId } from "./PatientDentistryTypes";
import { Tooth } from "./Tooth";

export interface PatientDentalAppointmentSummary {
  patientDentistryId: PatientDentistryId;
  appointmentDate: Date;
  treatedTeeth: (Tooth | undefined)[];
  extractedTeeth: (Tooth | undefined)[];
}
