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

    // The rank travels with each project, and it has to: picking a project on
    // the dashboard is what fills the context the sidebar reads, and the project
    // layout does not re-fetch a project it already holds. Left out here, an
    // admin arrived at their project with no rank attached and lost the Users
    // and Settings menu they had just been given.
    //
    // Both flags are functionally determined by project_id, so they do not
    // widen the DISTINCT above.
    const query = `
      SELECT
        DISTINCT project.project_id,
        project.project_name,
        project.project_description,
        project.project_timezone,
        project.project_length_unit,
        project.project_weight_unit,
        project.project_temperature_unit,
        project.project_date_format,
        project.owner_id,
        project.created_at,
        (project.owner_id = ANY($1::uuid[])) AS is_owner,
        EXISTS (
          SELECT 1
          FROM project_user caller_membership
          WHERE caller_membership.project_id = project.project_id
            AND caller_membership.user_id = ANY($1::uuid[])
            AND caller_membership.is_user_active = TRUE
            AND caller_membership.is_user_admin = TRUE
        ) AS is_admin
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
      projectLengthUnit: row.project_length_unit,
      projectWeightUnit: row.project_weight_unit,
      projectTemperatureUnit: row.project_temperature_unit,
      projectDateFormat: row.project_date_format,
      ownerId: row.owner_id,
      // Same precedence as assertProjectRole: owner outranks admin. Only rows
      // the caller may see are returned at all, so the fallback is membership.
      viewerRole: row.is_owner ? "owner" : row.is_admin ? "admin" : "member",
    }));

    return actionOk(projects);
  } catch (error) {
    return toActionFailure(error);
  }
};
