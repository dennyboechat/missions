"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";
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

export const insertProjectUser = async ({
  projectId,
  userId,
}: {
  projectId: ProjectId;
  userId: string;
}): Promise<ActionResult<ProjectUser[]>> => {
  try {
    await assertProjectAccess({ projectId }, { ownerOnly: true });

    const query = `
      INSERT INTO
        project_user (project_id, user_id, is_user_active) 
      SELECT
        $1::UUID, $2::UUID, $3
      WHERE
        NOT EXISTS (SELECT 1 FROM project_user WHERE project_id = $1 AND user_id = $2)
      RETURNING 
        project_user_id, project_id, user_id, is_user_active
    `;

    const response = await sql.query(query, [projectId, userId, true]);

    const projectUsers: ProjectUser[] = response.rows.map((row) => ({
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      isUserActive: row.is_user_active,
    }));

    return actionOk(projectUsers);
  } catch (error) {
    return toActionFailure(error);
  }
};
