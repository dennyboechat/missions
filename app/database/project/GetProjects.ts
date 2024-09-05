"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, ProjectOwnerId } from "../../types/ProjectTypes";

export const getProjects = async ({
  ownerId,
}: {
  ownerId: ProjectOwnerId;
}): Promise<Project[] | undefined> => {
  try {
    const query = `
      SELECT 
        * 
      FROM 
        project 
      WHERE 
        owner_id = $1
      ORDER BY
        project_id DESC  
    `;

    const response = await sql.query(query, [ownerId]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      ownerId: row.owner_id,
    }));

    return projects;
  } catch (error) {
    console.error(error);
  }
};
