"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
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

    return actionOk('deleted');
  } catch (error) {
    return toActionFailure(error);
  }
};
