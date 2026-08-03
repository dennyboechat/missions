// Types
import { Medication } from "../../../../types/Medication";
import { PrescribedMedication } from "../types/PrescribedMedication";

// Utils
import { generateUID } from "../../../../utils/generateUID";
import { getNewMedicationRecord } from "./getNewMedicationRecord";

/* A field that was never filled in reads back from the database as null, is held
   in the blank row as "", and is undefined on a row built in memory. All three
   mean the same thing, and comparing them literally would report a change on
   every refresh. */
const same = (value?: string | number, otherValue?: string | number) =>
  (value ?? "") === (otherValue ?? "");

const isSameMedication = (row: Medication, record: PrescribedMedication) =>
  same(row.drug, record.drug) &&
  same(row.dose, record.dose) &&
  same(row.quantity, record.quantity) &&
  same(row.instructions, record.instructions);

/**
 * Rows for a table that is being read while somebody else prescribes into it.
 *
 * The subtlety is rowId, which is the React key. The inputs in this table are
 * uncontrolled -- they take a defaultValue and let the DOM hold what is typed --
 * so a row that stays mounted keeps showing the old figure no matter what state
 * says. Making a colleague's change visible therefore means giving that row a new
 * key, which is what remounts it and lets the inputs read the new defaults.
 *
 * Which is also why the key is kept for every row that did *not* change: remount
 * an unchanged row and the cursor, the selection and any half-typed value in it
 * go with it. So:
 *
 *  - a row whose values still agree with the database keeps its identity;
 *  - a row whose values moved is replaced, and comes back showing them;
 *  - a row that somebody else added arrives at the end of the saved rows;
 *  - a row that somebody else deleted goes;
 *  - rows with no id yet -- the trailing blank one, and one whose insert is still
 *    in flight -- are the local user's, and are carried across untouched.
 *
 * The caller is responsible for not merging while the table has the cursor in it;
 * this function cannot see focus, and a merge mid-typing would be a merge of the
 * wrong thing. See the components that own the table.
 */
export const mergeMedicationRows = ({
  current,
  incoming,
}: {
  current: Medication[];
  incoming: PrescribedMedication[];
}): Medication[] => {
  const currentByUid = new Map(
    current
      .filter(({ medicationUid }) => medicationUid)
      .map((row) => [row.medicationUid, row]),
  );

  const savedRows: Medication[] = incoming.map((record) => {
    const currentRow = currentByUid.get(record.medicationUid);

    if (currentRow && isSameMedication(currentRow, record)) {
      return currentRow;
    }

    return {
      rowId: generateUID(),
      medicationUid: record.medicationUid,
      drug: record.drug,
      dose: record.dose,
      quantity: record.quantity,
      instructions: record.instructions,
    };
  });

  // Anything without an id belongs to this keyboard, not to the database: the
  // blank row at the bottom, or a row whose drug was just chosen and whose insert
  // has not answered yet.
  const localRows = current.filter(({ medicationUid }) => !medicationUid);

  const rows = [...savedRows, ...localRows];

  // The blank row is how anything new gets prescribed, so the table is never
  // without one.
  return localRows.length > 0 ? rows : [...rows, getNewMedicationRecord()];
};

/**
 * The same shape for a first load, where there is nothing to preserve.
 */
export const toMedicationRows = (
  incoming: PrescribedMedication[],
): Medication[] => mergeMedicationRows({ current: [], incoming });
