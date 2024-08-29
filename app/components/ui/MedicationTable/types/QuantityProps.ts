// Types
import { Medication, MedicationUid, Drug } from "../../../../types/Medication";

export interface QuantityProps {
  drug?: Drug;
  quantity?: number;
  medicationUid?: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
}
