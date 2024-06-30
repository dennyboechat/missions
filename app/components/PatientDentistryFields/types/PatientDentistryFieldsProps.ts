// Multivariate dependency
import { Dispatch, SetStateAction } from "react";

// Types
import { PatientDentistryTypes } from "../../../types/PatientDentistryTypes";

export interface PatientDentistryFieldsProps {
  patientDentistryFields: PatientDentistryTypes;
  setPatientDentistryFields: Dispatch<
    SetStateAction<PatientDentistryTypes | undefined>
  >;
}
