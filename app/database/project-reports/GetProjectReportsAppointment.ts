"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectReportsAppointmentTypes } from "../../types/ProjectReportsAppointmentTypes";
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

export const getProjectReportsAppointment = async ({
  projectId,
  startDate,
  endDate,
}: {
  projectId: ProjectId;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<ProjectReportsAppointmentTypes[]>> => {
  try {
    await assertProjectAccess({ projectId });

    // Days are bucketed in the project's own timezone, read from the row that
    // is already joined here. The date is returned as a YYYY-MM-DD string so
    // the browser renders the bucket itself and cannot re-derive a different
    // day from a timestamp.
    const query = `
      (
        SELECT
          TO_CHAR(
            (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date,
            'YYYY-MM-DD'
          ) AS appointment_date,
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
          (patient_general.appointment_date AT TIME ZONE project.project_timezone)::date BETWEEN $2::date AND $3::date
        GROUP BY
          1
        ORDER BY
          1
      )
      UNION ALL
      (
        SELECT
          TO_CHAR(
            (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date,
            'YYYY-MM-DD'
          ) AS appointment_date,
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
          (patient_dentistry.appointment_date AT TIME ZONE project.project_timezone)::date BETWEEN $2::date AND $3::date
        GROUP BY
          1
        ORDER BY
          1
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

    return actionOk(projectReports);
  } catch (error) {
    return toActionFailure(error);
  }
};
