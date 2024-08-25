// Types
import { Medication, MedicationUid } from "../../../../types/Medication";

export interface InstructionsProps {
  medicationUid: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
}
