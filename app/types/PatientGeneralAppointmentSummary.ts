// Types
import { PatientGeneralId } from "./PatientGeneralTypes";
import { Medication } from "./Medication";

export interface PatientGeneralAppointmentSummary {
  patientGeneralId: PatientGeneralId;
  appointmentDate: Date;
  prescribedMedication: Medication[];
}
