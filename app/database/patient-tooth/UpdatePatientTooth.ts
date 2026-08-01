"use server";

// Database
import { sql } from "@vercel/postgres";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

// Types
import {
  PatientDentistryTooth,
  UpdatePatientTooth,
} from "../../types/PatientDentistryTooth";


// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "tooth_name",
  "tooth_status",
  "tooth_notes",
];

export const updatePatientTooth = async ({
  patientDentistryToothId,
  field,
  value,
}: UpdatePatientTooth): Promise<ActionResult<PatientDentistryTooth>> => {
  try {
    await assertProjectAccess({ patientDentistryToothId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const query = `
      UPDATE
        patient_dentistry_tooth
      SET
        ${field} = $1
      WHERE
        patient_dentistry_tooth_id = $2
      RETURNING 
        patient_dentistry_tooth_id, patient_dentistry_id, tooth_name, tooth_status, tooth_notes
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientDentistryToothId,
    ]);

    const patientDentistryTooth: PatientDentistryTooth[] = response.rows.map(
      (row) => ({
        patientDentistryToothId: row.patient_dentistry_tooth_id,
        patientDentistryId: row.patient_dentistry_id,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
        toothNotes: row.tooth_notes,
      })
    );

    return patientDentistryTooth.length > 0
      ? actionOk(patientDentistryTooth[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
