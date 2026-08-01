"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId, ProjectTimezone } from "../../types/ProjectTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Read straight from the row rather than the cached project in localStorage,
// which predates the column for anyone who has not refreshed it.
export const getProjectTimezone = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ProjectTimezone | undefined> => {
  try {
    await assertProjectAccess({ projectId });

    const response = await sql.query(
      `SELECT project_timezone FROM project WHERE project_id = $1`,
      [projectId]
    );

    return response.rows.length > 0
      ? response.rows[0].project_timezone
      : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
