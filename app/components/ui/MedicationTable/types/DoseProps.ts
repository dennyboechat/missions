// Types
import { Medication, MedicationUid } from "../../../../types/Medication";

export interface DoseProps {
  medicationUid: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
}
