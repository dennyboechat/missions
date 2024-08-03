// Types
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentContentProps {
  patientDentistry: PatientDentistryTypes;
  afterDeleteAppointment: () => void;
}
