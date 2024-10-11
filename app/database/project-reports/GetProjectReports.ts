"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectReportsTypes } from "../../types/ProjectReportsTypes";
import { ProjectId } from "../../types/ProjectTypes";

export const getProjectReports = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ProjectReportsTypes[] | undefined> => {
  try {
    const query = `
      SELECT 
        patient_general_prescribed_medication.drug_name,
        patient_general_prescribed_medication.dose,
        patient_general_prescribed_medication.quantity
      FROM 
        project
      INNER JOIN
        patient_personal ON patient_personal.project_id = project.project_id
      LEFT JOIN
        patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
      LEFT JOIN  
        patient_general_prescribed_medication ON patient_general_prescribed_medication.patient_general_id = patient_general.patient_general_id  
      WHERE 
        project_id = $1
      ORDER BY
        patient_general_prescribed_medication.drug_name
    `;

    const response = await sql.query(query, [projectId]);

    const projectReports: ProjectReportsTypes[] = response.rows.map((row) => ({
      drug: row.drug_name,
      dose: row.dose,
      quantity: row.quantity,
    }));

    return projectReports;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
