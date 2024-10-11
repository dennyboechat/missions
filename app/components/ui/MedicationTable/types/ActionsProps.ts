// Types
import { Medication, MedicationUid, Drug } from "../../../../types/Medication";

export interface ActionsProps {
  medicationUid?: MedicationUid;
  drug?: Drug;
  setMedications: (medications: any) => Medication[] | void;
  deleteMedication: (medicationUid: string) => {};
}
