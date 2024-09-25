// Types
import { Dispatch, SetStateAction } from "react";
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

export interface GeneralAppointmentContentProps {
  patientGeneral: PatientGeneralTypes;
  setPatientGeneral: Dispatch<
    SetStateAction<PatientGeneralTypes[] | undefined>
  >;
  afterDeleteAppointment: () => void;
}
