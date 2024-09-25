// Types
import { Dispatch, SetStateAction } from "react";
import {
  PatientGeneralTypes,
  PatientGeneralId,
} from "../../../types/PatientGeneralTypes";

export interface GeneralAppointmentProps {
  patientGeneral: PatientGeneralTypes[];
  setPatientGeneral: Dispatch<SetStateAction<PatientGeneralTypes[] | undefined>>;
  defaultActiveTab: PatientGeneralId;
  afterDeleteAppointment: () => void;
}