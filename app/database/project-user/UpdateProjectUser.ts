"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser, UpdateProjectUser } from "../../types/ProjectUserTypes";

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

export const updateProjectUser = async ({
  projectUserId,
  isUserActive,
}: UpdateProjectUser): Promise<ActionResult<ProjectUser>> => {
  try {
    await assertProjectAccess({ projectUserId }, { ownerOnly: true });

    const query = `
      UPDATE 
        project_user 
      SET 
        is_user_active = $1
      WHERE 
        project_user_id = $2
      RETURNING 
        project_user_id, project_id, user_id, is_user_active
    `;

    const response = await sql.query(query, [isUserActive, projectUserId]);

    const projectUsers: ProjectUser[] = response.rows.map((row) => ({
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      isUserActive: row.is_user_active,
    }));

    return projectUsers.length > 0
      ? actionOk(projectUsers[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
