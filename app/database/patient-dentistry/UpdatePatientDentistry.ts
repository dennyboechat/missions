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
  PatientDental,
  UpdatePatientDentistry,
} from "../../types/PatientDentistryTypes";


// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "appointment_notes",
  "appointment_referral",
  "appointment_has_referral",
];

export const updatePatientDentistry = async ({
  patientDentistryId,
  field,
  value,
}: UpdatePatientDentistry): Promise<ActionResult<PatientDental>> => {
  try {
    const projectId = await assertProjectAccess({ patientDentistryId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    // Wrapped in a CTE so the returned appointment date can be resolved
    // against the project's timezone, matching how it is read everywhere else.
    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          patient_dentistry
        WHERE
          patient_dentistry_id = $2
      ),
      updated AS (
        UPDATE
          patient_dentistry
        SET
          ${field} = $1
        WHERE
          patient_dentistry_id = $2
        RETURNING *
      )
      SELECT
        updated.patient_dentistry_id,
        updated.patient_personal_id,
        updated.appointment_notes,
        updated.appointment_has_referral,
        updated.appointment_referral,
        TO_CHAR(
          (updated.appointment_date AT TIME ZONE project.project_timezone)::date,
          'YYYY-MM-DD'
        ) AS appointment_date,
        (SELECT value_before FROM previous)::text AS value_before
      FROM
        updated
      INNER JOIN
        patient_personal ON patient_personal.patient_personal_id = updated.patient_personal_id
      INNER JOIN
        project ON project.project_id = patient_personal.project_id
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;

    const response = await sql.query(query, [
      validatedValue,
      patientDentistryId,
    ]);

    const patientDentistries: PatientDental[] = response.rows.map((row) => ({
      patientDentistryId: row.patient_dentistry_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes ?? "",
      appointmentHasReferral: row.appointment_has_referral,
      appointmentReferral: row.appointment_referral ?? "",
      appointmentDate: row.appointment_date,
    }));

    if (patientDentistries.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "changed",
      entity: "dental appointment",
      entityId: patientDentistryId,
      patientPersonalId: response.rows[0].patient_personal_id,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(patientDentistries[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
