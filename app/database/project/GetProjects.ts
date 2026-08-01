"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project } from "../../types/ProjectTypes";

// Auth
import { getAuthenticatedUserIds } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const getProjects = async (): Promise<ActionResult<Project[]>> => {
  try {
    // Always the caller's own projects; passing an id in would let anyone
    // enumerate another user's projects. Matched against every app_user row
    // for this session, since duplicates do not share memberships.
    const userIds = await getAuthenticatedUserIds();

    const query = `
      SELECT
        DISTINCT project.project_id,
        project.project_name,
        project.project_description,
        project.project_timezone,
        project.owner_id,
        project.created_at
      FROM
        project
      LEFT JOIN
        project_user ON project_user.project_id = project.project_id
      WHERE
        project.owner_id = ANY($1::uuid[]) OR
        (
          project_user.user_id = ANY($1::uuid[]) AND
          is_user_active = TRUE
        )
      ORDER BY
        project.created_at DESC
    `;

    const response = await sql.query(query, [userIds]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      projectTimezone: row.project_timezone,
      ownerId: row.owner_id,
    }));

    return actionOk(projects);
  } catch (error) {
    return toActionFailure(error);
  }
};
