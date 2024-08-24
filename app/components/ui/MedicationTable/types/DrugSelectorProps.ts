// Types
import { Medication } from "../../../../types/Medication";

export interface DrugSelectorProps {
  drug?: string;
  medications: Medication[];
  setMedications: (medication: Medication[]) => void;
}
