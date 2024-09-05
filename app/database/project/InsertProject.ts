"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, NewProject } from "../../types/ProjectTypes";

export const insertProject = async ({
  projectName,
  projectDescription,
  ownerId,
}: NewProject): Promise<Project | undefined> => {
  try {
    const query = `
      INSERT INTO 
        project (project_name, project_description, owner_id) 
      VALUES 
        ($1, $2, $3)
      RETURNING 
        project_id, project_name, project_description, owner_id
    `;

    const response = await sql.query(query, [
      projectName.trim(),
      projectDescription?.trim(),
      ownerId,
    ]);

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
