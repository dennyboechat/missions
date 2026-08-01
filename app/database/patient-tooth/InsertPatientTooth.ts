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
  InsertPatientTooth,
} from "../../types/PatientDentistryTooth";

export const insertPatientTooth = async ({
  patientDentistryId,
  toothName,
  toothStatus,
  toothNotes,
}: InsertPatientTooth): Promise<ActionResult<PatientDentistryTooth>> => {
  try {
    await assertProjectAccess({ patientDentistryId });

    const query = `
      INSERT INTO
        patient_dentistry_tooth (patient_dentistry_id, tooth_name, tooth_status, tooth_notes)
      VALUES 
        ($1, $2, $3, $4)
      RETURNING 
        patient_dentistry_tooth_id, patient_dentistry_id, tooth_name, tooth_status, tooth_notes
    `;

    const response = await sql.query(query, [
      patientDentistryId,
      toothName,
      toothStatus,
      toothNotes,
    ]);

    const patientDentistryTooth: PatientDentistryTooth[] = response.rows.map(
      (row) => ({
        patientDentistryToothId: row.patient_dentistry_tooth_id,
        patientDentistryId: row.patient_dentistry_id,
        toothName: row.tooth_name,
        toothStatus: row.tooth_status,
        toothNotes: row.tooth_notes ?? "",
      })
    );

    return patientDentistryTooth.length > 0
      ? actionOk(patientDentistryTooth[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
