// Types
import {
  Medication,
  MedicationUid,
  Dose,
  Drug,
} from "../../../../types/Medication";

export interface DoseProps {
  drug?: Drug;
  dose?: Dose;
  medicationUid?: MedicationUid;
  setMedications: (medications: any) => Medication[] | void;
}
