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
  PatientGeneral,
  UpdatePatientGeneral,
} from "../../types/PatientGeneralTypes";


// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "appointment_notes",
  "appointment_referral",
  "appointment_has_referral",
  "patient_height",
  "patient_weight",
  "patient_temperature",
  "patient_blood_glucose",
  "patient_pulse",
  "patient_oxygen_saturation",
  "patient_blood_pressure_systolic",
  "patient_blood_pressure_diastolic",
  "patient_vision_left_tested_distance",
  "patient_vision_left_normal_distance",
  "patient_vision_right_tested_distance",
  "patient_vision_right_normal_distance",
];

export const updatePatientGeneral = async ({
  patientGeneralId,
  field,
  value,
}: UpdatePatientGeneral): Promise<ActionResult<PatientGeneral>> => {
  try {
    const projectId = await assertProjectAccess({ patientGeneralId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    // Wrapped in a CTE so the returned appointment date can be resolved
    // against the project's timezone, matching how it is read everywhere else.
    //
    // `previous` reads the column before the update: the CTEs share one snapshot,
    // so it sees the old value even though the UPDATE beside it is writing the
    // new one. That is what lets the audit trail record what a figure changed
    // from without a second round trip to fetch it first.
    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          patient_general
        WHERE
          patient_general_id = $2
      ),
      updated AS (
        UPDATE
          patient_general
        SET
          ${field} = $1
        WHERE
          patient_general_id = $2
        RETURNING *
      )
      SELECT
        updated.patient_general_id,
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

    const response = await sql.query(query, [validatedValue, patientGeneralId]);

    const patientGeneral: PatientGeneral[] = response.rows.map((row) => ({
      patientGeneralId: row.patient_general_id,
      patientPersonalId: row.patient_personal_id,
      appointmentNotes: row.appointment_notes ?? "",
      appointmentHasReferral: row.appointment_has_referral,
      appointmentReferral: row.appointment_referral ?? "",
      appointmentDate: row.appointment_date,
    }));

    if (patientGeneral.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "changed",
      entity: "general appointment",
      entityId: patientGeneralId,
      patientPersonalId: patientGeneral[0].patientPersonalId,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(patientGeneral[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
