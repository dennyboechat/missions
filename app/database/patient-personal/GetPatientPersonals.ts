"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId } from "../../types/ProjectTypes";
import { PatientPersonalTypes } from "../../types/PatientPersonalTypes";

export const getPatientPersonals = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<PatientPersonalTypes[] | undefined> => {
  try {
    const query = `
      SELECT 
        * 
      FROM 
        patient_personal 
      WHERE 
        project_id = $1
      ORDER BY
        patient_full_name ASC  
    `;

    const response = await sql.query(query, [projectId]);

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

    return patientPersonals;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
