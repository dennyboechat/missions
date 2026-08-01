// Types
import { Medication } from "../../../../types/Medication";

export interface DrugSelectorProps {
  /** Identifies the row, so focus can be handed to its amount field. */
  rowId: string;
  drug?: string;
  medications: Medication[];
  setMedications: (medications: Medication[]) => void;
  insertMedication: (drug: string, updatedMedications: Medication[]) => void;
}
