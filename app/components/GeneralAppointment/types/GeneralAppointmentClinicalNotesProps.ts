// Types
import { Dispatch, SetStateAction } from "react";
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

export interface GeneralAppointmentClinicalNotesProps {
  patientGeneral: PatientGeneralTypes;
  setPatientGeneral: Dispatch<
    SetStateAction<PatientGeneralTypes[] | undefined>
  >;
}
