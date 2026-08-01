"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, NewProject } from "../../types/ProjectTypes";

// Utils
import { isValidTimezone } from "../../utils/isValidTimezone";

// Auth
import { getAuthenticatedUserId } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const insertProject = async ({
  projectName,
  projectDescription,
  projectTimezone,
}: NewProject): Promise<ActionResult<Project>> => {
  try {
    // The owner is taken from the session, never from the request: a caller
    // could otherwise create a project owned by somebody else.
    const ownerId = await getAuthenticatedUserId();

    const query = `
      INSERT INTO
        project (project_name, project_description, project_timezone, owner_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        project_id, project_name, project_description, project_timezone, owner_id
    `;

    const response = await sql.query(query, [
      projectName.trim(),
      projectDescription?.trim(),
      isValidTimezone({ timezone: projectTimezone }) ? projectTimezone : "UTC",
      ownerId,
    ]);

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
