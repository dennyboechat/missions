// Multivariate dependency
import { Dispatch, SetStateAction } from "react";

// Types
import { PatientPersonalTypes } from "../../../types/PatientPersonalTypes";

export interface PatientPersonalFieldsProps {
  patientPersonalFields: PatientPersonalTypes;
  setPatientPersonalFields: Dispatch<
    SetStateAction<PatientPersonalTypes | undefined>
  >;
}
