"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, UpdateProject } from "../../types/ProjectTypes";

export const updateProject = async ({
  projectId,
  field,
  value,
}: UpdateProject): Promise<Project | undefined> => {
  try {
    const query = `
      UPDATE 
        project 
      SET 
        ${field} = $1
      WHERE 
        project_id = $2
      RETURNING 
        project_id, project_name, project_description, owner_id
    `;

    const response = await sql.query(query, [value, projectId]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      ownerId: row.owner_id,
    }));

    return projects?.length > 0 ? projects[0] : undefined;
  } catch (error) {
    console.error(error);
  }
};
