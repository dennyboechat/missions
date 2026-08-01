"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectReportsMedicationTypes } from "../../types/ProjectReportsMedicationTypes";
import { ProjectId } from "../../types/ProjectTypes";

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

export const getProjectReportsMedication = async ({
  projectId,
  startDate,
  endDate,
}: {
  projectId: ProjectId;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<ProjectReportsMedicationTypes[]>> => {
  try {
    await assertProjectAccess({ projectId });

    // Same date window as the appointments report: the project's timezone,
    // read from the joined project row.
    const query = `
      (
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
          project.project_id = $1 AND
          (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date BETWEEN $2::date AND $3::date
        ORDER BY
          patient_general_prescribed_medication.drug_name
      )
      UNION ALL  
      (
        SELECT 
          patient_dentistry_prescribed_medication.drug_name,
          patient_dentistry_prescribed_medication.dose,
          patient_dentistry_prescribed_medication.quantity
        FROM 
          project
        INNER JOIN
          patient_personal ON patient_personal.project_id = project.project_id
        LEFT JOIN
          patient_dentistry ON patient_dentistry.patient_personal_id = patient_personal.patient_personal_id
        LEFT JOIN
          patient_dentistry_prescribed_medication ON patient_dentistry_prescribed_medication.patient_dentistry_id = patient_dentistry.patient_dentistry_id  
        WHERE 
          project.project_id = $1 AND
          (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date BETWEEN $2::date AND $3::date
        ORDER BY
          patient_dentistry_prescribed_medication.drug_name
      )
    `;

    const response = await sql.query(query, [projectId, startDate, endDate]);

    const projectReports: ProjectReportsMedicationTypes[] = response.rows.map((row) => ({
      drug: row.drug_name,
      dose: row.dose,
      quantity: row.quantity,
    }));

    return actionOk(projectReports);
  } catch (error) {
    return toActionFailure(error);
  }
};
