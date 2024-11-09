// Types
import { Dispatch, SetStateAction } from "react";
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

export interface DentalAppointmentReferralProps {
  patientDentistry: PatientDentistryTypes;
  setPatientDentistries: Dispatch<
    SetStateAction<PatientDentistryTypes[] | undefined>
  >;
}
