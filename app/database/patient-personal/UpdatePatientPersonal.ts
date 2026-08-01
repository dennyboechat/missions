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
  UpdatePatientPersonal,
} from "../../types/PatientPersonalTypes";


// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = [
  "patient_full_name",
  "is_patient_male",
  "patient_date_of_birth",
  "patient_phone_number",
];

export const updatePatientPersonal = async ({
  patientPersonalId,
  field,
  value,
}: UpdatePatientPersonal): Promise<ActionResult<PatientPersonalTypes>> => {
  try {
    await assertProjectAccess({ patientPersonalId });

    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new Error(`Field not updatable: ${field}`);
    }

    const query = `
      UPDATE 
        patient_personal 
      SET 
        ${field} = $1
      WHERE 
        patient_personal_id = $2
      RETURNING 
        patient_personal_id, project_id, patient_full_name, is_patient_male, TO_CHAR(patient_date_of_birth, 'YYYY-MM-DD') AS patient_date_of_birth, patient_phone_number
    `;

    const validatedValue = typeof value === "string" ? value.trim() : value;
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

    return patientPersonals.length > 0
      ? actionOk(patientPersonals[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
