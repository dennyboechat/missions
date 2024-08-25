// Types
import { Medication, MedicationUid } from "../../../../types/Medication";

export interface QuantityProps {
  medicationUid: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
}
