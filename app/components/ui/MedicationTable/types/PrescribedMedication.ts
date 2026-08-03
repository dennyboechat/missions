// Types
import {
  Dose,
  Drug,
  Instructions,
  MedicationUid,
} from "../../../../types/Medication";

/**
 * One prescribed medication as the database has it.
 *
 * The general and dentistry tables name their key differently
 * (patient_general_prescribed_medication_id, patient_dentistry_...), so each
 * caller renames its own id to medicationUid and everything downstream -- the
 * merge, the rows, the table -- stays one implementation.
 */
export interface PrescribedMedication {
  medicationUid: MedicationUid;
  drug?: Drug;
  dose?: Dose;
  quantity?: number;
  instructions?: Instructions;
}
