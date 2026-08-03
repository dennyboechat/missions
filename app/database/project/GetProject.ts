"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, ProjectId } from "../../types/ProjectTypes";

// Auth
import { assertProjectRole } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const getProject = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ActionResult<Project>> => {
  try {
    // The role comes back from the check that was happening anyway, so every
    // screen learns what the caller is to this project for no extra query.
    const { role } = await assertProjectRole({ projectId });

    const query = `
      SELECT
        project_id,
        project_name,
        project_description,
        project_timezone,
        project_length_unit,
        project_weight_unit,
        project_temperature_unit,
        project_date_format,
        owner_id
      FROM
        project
      WHERE 
        project_id = $1
    `;

    const response = await sql.query(query, [projectId]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      projectTimezone: row.project_timezone,
      projectLengthUnit: row.project_length_unit,
      projectWeightUnit: row.project_weight_unit,
      projectTemperatureUnit: row.project_temperature_unit,
      projectDateFormat: row.project_date_format,
      ownerId: row.owner_id,
      viewerRole: role,
    }));

    return projects.length > 0
      ? actionOk(projects[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
