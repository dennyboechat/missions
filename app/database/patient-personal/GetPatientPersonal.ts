"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, ProjectId } from "../../types/ProjectTypes";
import { PatientPersonal } from "../../types/PatientPersonalTypes";

export const getPatientPersonals = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<PatientPersonal[] | undefined> => {
  try {
    const response = await sql`
      SELECT 
        * 
      FROM 
        patient_personal 
      WHERE 
        project_id = ${projectId}
      ORDER BY
        patient_full_name DESC  
    `;

    const patientPersonals: PatientPersonal[] = response.rows.map((row) => ({
      patientPersonalId: row.patient_personal_id,
      projectId: row.project_id,
      patientFullName: row.patient_full_name,
      isPatientMale: row.is_patient_male,
      patientDateOfBirth: row.patient_date_of_birth,
    }));

    return patientPersonals;
  } catch (error) {
    console.error(error);
  }
};
