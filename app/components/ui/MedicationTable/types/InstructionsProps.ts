// Types
import {
  Medication,
  MedicationUid,
  Drug,
  Instructions,
} from "../../../../types/Medication";

export interface InstructionsProps {
  drug?: Drug;
  instructions?: Instructions;
  medicationUid?: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
}
