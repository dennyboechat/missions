// Types
import { Dispatch, SetStateAction } from "react";
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentContentProps {
  patientDentistry: PatientDentistryTypes;
  setPatientDentistries: Dispatch<
    SetStateAction<PatientDentistryTypes[] | undefined>
  >;
  afterDeleteAppointment: () => void;
}
