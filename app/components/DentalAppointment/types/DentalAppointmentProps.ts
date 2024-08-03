// Types
import { Dispatch, SetStateAction } from "react";
import {
  PatientDentistryTypes,
  PatientDentistryId,
} from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentProps {
  patientDentistries: PatientDentistryTypes[];
  setPatientDentistries: Dispatch<SetStateAction<PatientDentistryTypes[] | undefined>>;
  defaultActiveTab: PatientDentistryId;
  afterDeleteAppointment: () => void;
}
