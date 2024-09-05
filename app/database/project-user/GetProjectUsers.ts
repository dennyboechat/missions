"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";
import { ProjectId } from "../../types/ProjectTypes";

export const getProjectUsers = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<ProjectUser[] | undefined> => {
  try {
    const query = `
      SELECT 
        * 
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
    }));

    return projectUsers;
  } catch (error) {
    console.error(error);
  }
};
