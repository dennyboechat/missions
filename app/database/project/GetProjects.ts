"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, ProjectOwnerId } from "../../types/ProjectTypes";

export const getProjects = async ({
  userId,
}: {
  userId: ProjectOwnerId;
}): Promise<Project[] | undefined> => {
  try {
    const query = `
      SELECT 
        DISTINCT project.*
      FROM 
        project
      LEFT JOIN
        project_user ON project_user.project_id = project.project_id  
      WHERE 
        project.owner_id = $1 OR
        (
          project_user.user_id = $1 AND
          is_user_active = TRUE
        )
      ORDER BY
        project.created_at DESC
    `;

    const response = await sql.query(query, [userId]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      ownerId: row.owner_id,
    }));

    return projects;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
