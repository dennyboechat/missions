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
  PatientPersonalTypes,
  NewPatientPersonal,
} from "../../types/PatientPersonalTypes";

export const insertPatientPersonal = async ({
  projectId,
  patientFullName,
  isPatientMale,
  patientDateOfBirth,
  patientPhoneNumber,
}: NewPatientPersonal): Promise<ActionResult<PatientPersonalTypes>> => {
  try {
    await assertProjectAccess({ projectId });

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
      patientFullName.trim(),
      isPatientMale,
      patientDateOfBirth,
      patientPhoneNumber,
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

    return patientPersonals.length > 0
      ? actionOk(patientPersonals[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
