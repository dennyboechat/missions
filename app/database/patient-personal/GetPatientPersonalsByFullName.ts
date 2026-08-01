"use server";

// Database
import { sql } from "@vercel/postgres";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import { ActionResult, actionOk } from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

// Types
import { ProjectId } from "../../types/ProjectTypes";
import {
  PatientPersonalTypes,
  PatientPersonalFullName,
} from "../../types/PatientPersonalTypes";

/**
 * Patients in the project already registered under the given name, so the form
 * can warn about a possible duplication before another one is created.
 *
 * The comparison ignores case and surrounding spaces: "ana silva " and
 * "Ana Silva" are the same person as far as the warning is concerned.
 */
export const getPatientPersonalsByFullName = async ({
  projectId,
  patientFullName,
}: {
  projectId: ProjectId;
  patientFullName: PatientPersonalFullName;
}): Promise<ActionResult<PatientPersonalTypes[]>> => {
  try {
    await assertProjectAccess({ projectId });

    const trimmedFullName = patientFullName.trim();

    if (trimmedFullName === "") {
      return actionOk([]);
    }

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
        project_id = $1
        AND LOWER(TRIM(patient_full_name)) = LOWER($2)
      ORDER BY
        patient_date_of_birth ASC
    `;

    const response = await sql.query(query, [projectId, trimmedFullName]);

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

    return actionOk(patientPersonals);
  } catch (error) {
    return toActionFailure(error);
  }
};
