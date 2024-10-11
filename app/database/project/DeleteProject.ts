"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId } from "../../types/ProjectTypes";

export const deleteProject = async ({
  projectId,
}: {
  projectId: ProjectId;
}) => {
  try {
    const query = `
      DELETE FROM 
        project 
      WHERE 
        project_id = $1
    `;

    await sql.query(query, [projectId]);

    return 'deleted';
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
