"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectId } from "../../types/ProjectTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

export const deleteProject = async ({
  projectId,
}: {
  projectId: ProjectId;
}) => {
  try {
    // Cascades to every patient, appointment and prescription in the project.
    await assertProjectAccess({ projectId }, { ownerOnly: true });

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
