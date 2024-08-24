// Types
import { Medication, MedicationUid, Drug } from "../../../../types/Medication";

export interface ActionsProps {
  medicationUid: MedicationUid;
  drug?: Drug;
  setMedications: (medication: Medication[]) => void;
}
