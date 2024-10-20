// Multivariate dependency
import { Dispatch, SetStateAction } from "react";

// Types
import {
  PatientPersonalId,
  PatientPersonalFullName,
} from "../../../types/PatientPersonalTypes";
import { ProjectId } from "../../../types/ProjectTypes";

export interface PatientPersonalFieldsTypes {
  patientPersonalId?: PatientPersonalId;
  projectId: ProjectId;
  patientFullName?: PatientPersonalFullName;
  isPatientMale?: boolean;
  patientDateOfBirth?: Date;
  patientPhoneNumber?: string;
}

export interface PatientPersonalFieldsProps {
  patientPersonalFields: PatientPersonalFieldsTypes;
  setPatientPersonalFields: Dispatch<
    SetStateAction<PatientPersonalFieldsTypes>
  >;
  isPatientFullNameInvalid?: boolean;
  isPatientGenderInvalid?: boolean;
  isPatientDateOfBirthInvalid?: boolean;
}
