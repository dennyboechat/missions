// Types
import { Medication } from "../../../../types/Medication";

// Utils
import { generateUID } from "../../../../utils/generateUID";

export const getNewMedicationRecord = (): Medication => {
  return {
    uid: generateUID(),
    drug: undefined,
    dose: undefined,
    quantity: undefined,
    instructions: undefined,
  };
};
