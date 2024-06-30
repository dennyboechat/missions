// Multivariate dependency
import { Dispatch, SetStateAction } from "react";

// Types
import { PatientPersonal } from "../../../types/PatientPersonalTypes";

export interface PatientPersonalFieldsProps {
  patientPersonalFields: PatientPersonal;
  setPatientPersonalFields: Dispatch<SetStateAction<PatientPersonal | undefined>>;
}
