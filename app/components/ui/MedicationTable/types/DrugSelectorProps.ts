// Types
import { Medication } from "../../../../types/Medication";

export interface DrugSelectorProps {
  drug?: string;
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
}
