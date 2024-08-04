// Types
import { Dispatch, SetStateAction } from "react";
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentClinicalNotesProps {
  patientDentistry: PatientDentistryTypes;
  setPatientDentistries: Dispatch<
    SetStateAction<PatientDentistryTypes[] | undefined>
  >;
}
