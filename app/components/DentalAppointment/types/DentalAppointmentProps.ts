// Types
import {
  PatientDentistryTypes,
  PatientDentistryId,
} from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentProps {
  patientDentistries: PatientDentistryTypes[];
  defaultActiveTab: PatientDentistryId;
}
