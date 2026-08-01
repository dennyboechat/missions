"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { PatientPersonalId } from "../../types/PatientPersonalTypes";
import { PatientPersonalSummary } from "../../types/PatientPersonalSummary";

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

export const getPatientSummary = async ({
  patientPersonalId,
}: {
  patientPersonalId: PatientPersonalId;
}): Promise<ActionResult<PatientPersonalSummary>> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    const query = `
      SELECT
        patient_personal_id,
        project_id,
        patient_full_name,
        is_patient_male,
        patient_phone_number,
        TO_CHAR(patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth
      FROM
        patient_personal
      WHERE
        patient_personal_id = $1
    `;

    const response = await sql.query(query, [patientPersonalId]);

    const patientPersonalSummary: PatientPersonalSummary[] = response.rows.map(
      (row) => ({
        patientPersonalId: row.patient_personal_id,
        projectId: row.project_id,
        patientFullName: row.patient_full_name,
        isPatientMale: row.is_patient_male,
        patientDateOfBirth: row.patient_date_of_birth,
        patientPhoneNumber: row.patient_phone_number,
      })
    );

    return patientPersonalSummary.length > 0
      ? actionOk(patientPersonalSummary[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
