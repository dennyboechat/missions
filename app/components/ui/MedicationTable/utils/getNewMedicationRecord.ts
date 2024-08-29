// Types
import { Medication } from "../../../../types/Medication";

// Utils
import { generateUID } from "../../../../utils/generateUID";

export const getNewMedicationRecord = (): Medication => {
  return {
    rowId: generateUID(),
    drug: undefined,
    dose: '',
    quantity: undefined,
    instructions: '',
  };
};
