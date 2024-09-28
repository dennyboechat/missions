// Types
import { Dispatch, SetStateAction } from "react";
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

export interface GeneralPatientHeightProps {
  patientGeneralId: string;
  patientHeight?: number;
  setPatientGeneral: Dispatch<
    SetStateAction<PatientGeneralTypes[] | undefined>
  >;
}
