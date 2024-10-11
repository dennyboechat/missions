"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser, UpdateProjectUser } from "../../types/ProjectUserTypes";

export const updateProjectUser = async ({
  projectUserId,
  isUserActive,
}: UpdateProjectUser): Promise<ProjectUser | undefined> => {
  try {
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

    return projectUsers?.length > 0 ? projectUsers[0] : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
