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
  PatientPersonalTypes,
  UpdatePatientPersonal,
} from "../../types/PatientPersonalTypes";


// Validation
import {
  assertPresentText,
  assertPastDate,
  assertBoolean,
  assertOptionalText,
} from "../validation/fieldGuards";

// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "patient_full_name",
  "is_patient_male",
  "patient_date_of_birth",
  "patient_phone_number",
];

// The same rules the insert applies, per column: editing a patient must not be
// a way to store what creating one rejects.
const VALIDATE_FIELD: Record<
  string,
  (value: string | boolean) => string | boolean | undefined
> = {
  patient_full_name: (value) =>
    assertPresentText(value as string, "patient_full_name"),
  is_patient_male: (value) => assertBoolean(value, "is_patient_male"),
  patient_date_of_birth: (value) =>
    assertPastDate(value as string, "patient_date_of_birth"),
  patient_phone_number: (value) =>
    assertOptionalText(value as string, "patient_phone_number"),
};

export const updatePatientPersonal = async ({
  patientPersonalId,
  field,
  value,
}: UpdatePatientPersonal): Promise<ActionResult<PatientPersonalTypes>> => {
  try {
    const projectId = await assertProjectAccess({ patientPersonalId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const query = `
      WITH previous AS (
        SELECT
          ${field} AS value_before
        FROM
          patient_personal
        WHERE
          patient_personal_id = $2
      )
      UPDATE 
        patient_personal 
      SET 
        ${field} = $1
      WHERE 
        patient_personal_id = $2
      RETURNING
        patient_personal_id, project_id, patient_full_name, is_patient_male, TO_CHAR(patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth, patient_phone_number,
        (SELECT value_before FROM previous)::text AS value_before
    `;

    const validatedValue = VALIDATE_FIELD[field](value);
    const response = await sql.query(query, [
      validatedValue,
      patientPersonalId,
    ]);

    const patientPersonals: PatientPersonalTypes[] = response.rows.map(
      (row) => ({
        patientPersonalId: row.patient_personal_id,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
        patientPhoneNumber: row.patient_phone_number,
      })
    );

    if (patientPersonals.length === 0) {
      return actionFailed("not_found");
    }

    await recordAuditEvent({
      projectId,
      action: "changed",
      entity: "patient",
      entityId: patientPersonalId,
      patientPersonalId: response.rows[0].patient_personal_id,
      field,
      valueBefore: response.rows[0].value_before,
      valueAfter: validatedValue,
    });

    return actionOk(patientPersonals[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
