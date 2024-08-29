// Types
import { PatientDentistryId } from "../../../../types/PatientDentistryTypes";
import { Medication } from "../../../../types/Medication";

export interface DrugSelectorProps {
  patientDentistryId: PatientDentistryId;
  drug?: string;
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
}
