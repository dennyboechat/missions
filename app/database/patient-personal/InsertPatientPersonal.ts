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
  NewPatientPersonal,
} from "../../types/PatientPersonalTypes";

// Validation
import {
  assertPresentText,
  assertPastDate,
  assertBoolean,
  assertOptionalText,
} from "../validation/fieldGuards";

export const insertPatientPersonal = async ({
  projectId,
  patientFullName,
  isPatientMale,
  patientDateOfBirth,
  patientPhoneNumber,
}: NewPatientPersonal): Promise<ActionResult<PatientPersonalTypes>> => {
  try {
    await assertProjectAccess({ projectId });

    // The form checks all of this, but the form is not what a hand-made
    // request goes through.
    const validatedFullName = assertPresentText(
      patientFullName,
      "patient_full_name"
    );
    const validatedDateOfBirth = assertPastDate(
      patientDateOfBirth,
      "patient_date_of_birth"
    );
    const validatedIsPatientMale = assertBoolean(
      isPatientMale,
      "is_patient_male"
    );
    const validatedPhoneNumber = assertOptionalText(
      patientPhoneNumber,
      "patient_phone_number"
    );

    const query = `
      INSERT INTO 
        patient_personal (project_id, patient_full_name, is_patient_male, patient_date_of_birth, patient_phone_number)
      VALUES 
        ($1, $2, $3, $4, $5)
      RETURNING 
        patient_personal_id, project_id, patient_full_name, is_patient_male, TO_CHAR(patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth, patient_phone_number
    `;

    const response = await sql.query(query, [
      projectId,
      validatedFullName,
      validatedIsPatientMale,
      validatedDateOfBirth,
      validatedPhoneNumber,
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
      action: "added",
      entity: "patient",
      entityId: patientPersonals[0].patientPersonalId,
      patientPersonalId: patientPersonals[0].patientPersonalId,
    });

    return actionOk(patientPersonals[0]);
  } catch (error) {
    return toActionFailure(error);
  }
};
