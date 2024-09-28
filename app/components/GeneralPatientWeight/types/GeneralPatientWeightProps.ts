// Types
import { Dispatch, SetStateAction } from "react";
import { PatientGeneralTypes } from "../../../types/PatientGeneralTypes";

export interface GeneralPatientWeightProps {
  patientGeneralId: string;
  patientWeight?: number;
  setPatientGeneral: Dispatch<
    SetStateAction<PatientGeneralTypes[] | undefined>
  >;
}
