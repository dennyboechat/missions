// Types
import { PatientPersonalId } from "../../../types/PatientPersonalTypes";

export interface PatientMenuItemsProps {
  patientPersonalId: PatientPersonalId;
  activeMenuItem: "patient-personal" | "patient-dentistry" | "patient-summary";
}
