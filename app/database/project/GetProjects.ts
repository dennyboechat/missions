"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project } from "../../types/ProjectTypes";

// Auth
import { getAuthenticatedUserIds } from "../auth/projectAccess";

export const getProjects = async (): Promise<Project[] | undefined> => {
  try {
    // Always the caller's own projects; passing an id in would let anyone
    // enumerate another user's projects. Matched against every app_user row
    // for this session, since duplicates do not share memberships.
    const userIds = await getAuthenticatedUserIds();

    const query = `
      SELECT
        DISTINCT project.*
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

    return projects;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
