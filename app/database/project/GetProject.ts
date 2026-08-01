"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { Project, ProjectId } from "../../types/ProjectTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

export const getProject = async ({
  projectId,
}: {
  projectId: ProjectId;
}): Promise<Project | undefined> => {
  try {
    await assertProjectAccess({ projectId });

    const query = `
      SELECT 
        * 
      FROM 
        project 
      WHERE 
        project_id = $1
    `;

    const response = await sql.query(query, [projectId]);

    const projects: Project[] = response.rows.map((row) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectDescription: row.project_description,
      projectTimezone: row.project_timezone,
      ownerId: row.owner_id,
    }));

    return projects && projects.length > 0 ? projects[0] : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
