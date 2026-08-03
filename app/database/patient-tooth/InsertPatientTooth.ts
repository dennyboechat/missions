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

// Audit
import { recordAuditEvent } from "../audit/recordAuditEvent";

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
    const projectId = await assertProjectAccess({ patientDentistryId });

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

    if (patientDentistryTooth.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "added",
      patientDentistryId,
      entity: "tooth",
      entityId: patientDentistryTooth[0].patientDentistryToothId,
      field: "tooth_status",
      valueAfter: patientDentistryTooth[0].toothStatus,
    });

    return actionOk(patientDentistryTooth[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
