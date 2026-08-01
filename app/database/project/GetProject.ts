"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, ProjectId } from "../../types/ProjectTypes";

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

export const getProject = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ActionResult<Project>> => {
  try {
    await assertProjectAccess({ projectId });

    const query = `
      SELECT
        project_id,
        project_name,
        project_description,
        project_timezone,
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
      ownerId: row.owner_id,
    }));

    return projects.length > 0
      ? actionOk(projects[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
