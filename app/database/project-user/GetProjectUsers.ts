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

export const getProjectUsers = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ActionResult<ProjectUser[]>> => {
  try {
    await assertProjectAccess({ projectId }, { requires: "admin" });

    const query = `
      SELECT
        project_user.project_user_id,
        project_user.project_id,
        project_user.user_id,
        project_user.is_user_active,
        project_user.is_user_admin,
        app_user.user_name,
        app_user.user_email
      FROM
        project_user
      INNER JOIN
        app_user ON app_user.user_id = project_user.user_id  
      WHERE 
        project_id = $1
      ORDER BY
        app_user.user_name  
    `;

    const response = await sql.query(query, [projectId]);

    const projectUsers: ProjectUser[] = response.rows.map((row) => ({
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      isUserActive: row.is_user_active,
      isUserAdmin: row.is_user_admin,
    }));

    return actionOk(projectUsers);
  } catch (error) {
    return toActionFailure(error);
  }
};
