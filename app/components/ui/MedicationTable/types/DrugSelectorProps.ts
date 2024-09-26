// Types
import { Medication } from "../../../../types/Medication";

export interface DrugSelectorProps {
  drug?: string;
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  insertMedication: (drug: string, updatedMedications: Medication[]) => void;
}
