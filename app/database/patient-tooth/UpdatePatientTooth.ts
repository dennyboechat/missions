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
    const projectId = await assertProjectAccess({ patientDentistryToothId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          patient_dentistry_tooth
        WHERE
          patient_dentistry_tooth_id = $2
      )
      UPDATE
        patient_dentistry_tooth
      SET
        ${field} = $1
      WHERE
        patient_dentistry_tooth_id = $2
      RETURNING
        patient_dentistry_tooth_id, patient_dentistry_id, tooth_name, tooth_status, tooth_notes,
        (SELECT value_before FROM previous)::text AS value_before,
        (SELECT patient_dentistry.patient_personal_id FROM patient_dentistry WHERE patient_dentistry.patient_dentistry_id = patient_dentistry_tooth.patient_dentistry_id) AS patient_personal_id
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
        toothNotes: row.tooth_notes ?? "",
      })
    );

    if (patientDentistryTooth.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "changed",
      entity: "tooth",
      entityId: patientDentistryToothId,
      patientPersonalId: response.rows[0].patient_personal_id,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(patientDentistryTooth[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
