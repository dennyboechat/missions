"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId, ProjectTimezone } from "../../types/ProjectTypes";

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

// Read straight from the row rather than the cached project in localStorage,
// which predates the column for anyone who has not refreshed it.
export const getProjectTimezone = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ActionResult<ProjectTimezone>> => {
  try {
    await assertProjectAccess({ projectId });

    const response = await sql.query(
      `SELECT project_timezone FROM project WHERE project_id = $1`,
      [projectId]
    );

    return response.rows.length > 0
      ? actionOk(response.rows[0].project_timezone)
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
