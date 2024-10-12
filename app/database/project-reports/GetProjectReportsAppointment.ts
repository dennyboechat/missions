"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectReportsAppointmentTypes } from "../../types/ProjectReportsAppointmentTypes";
import { ProjectId } from "../../types/ProjectTypes";

export const getProjectReportsAppointment = async ({
  projectId,
  startDate,
  endDate,
}: {
  projectId: ProjectId;
  startDate?: string;
  endDate?: string;
}): Promise<ProjectReportsAppointmentTypes[] | undefined> => {
  try {
    const query = `
      (
        SELECT
          patient_general.appointment_date,
          COUNT(patient_general.patient_general_id) AS appointment_count,
          'general' AS appointment_type
        FROM 
          project
        INNER JOIN
          patient_personal ON patient_personal.project_id = project.project_id
        LEFT JOIN
          patient_general ON patient_general.patient_personal_id = patient_personal.patient_personal_id
        WHERE 
          project.project_id = $1 AND
          patient_general.appointment_date BETWEEN $2 AND $3
        GROUP BY
          patient_general.appointment_date  
        ORDER BY
          patient_general.appointment_date
      )
      UNION ALL  
      (
        SELECT 
          patient_dentistry.appointment_date,
          COUNT(patient_dentistry.patient_dentistry_id) AS appointment_count,
          'dental' AS appointment_type
        FROM 
          project
        INNER JOIN
          patient_personal ON patient_personal.project_id = project.project_id
        LEFT JOIN
          patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
        WHERE 
          project.project_id = $1 AND
          patient_dentistry.appointment_date BETWEEN $2 AND $3
        GROUP BY
          patient_dentistry.appointment_date
        ORDER BY
          patient_dentistry.appointment_date
      )
    `;

    const response = await sql.query(query, [projectId, startDate, endDate]);

    const projectReports: ProjectReportsAppointmentTypes[] = response.rows.map(
      (row) => ({
        appointmentDate: row.appointment_date,
        quantity: row.appointment_count,
        appointmentType: row.appointment_type,
      })
    );

    return projectReports;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
