"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";
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

export const insertProjectUser = async ({
  projectId,
  userId,
}: {
  projectId: ProjectId;
  userId: string;
}): Promise<ActionResult<ProjectUser[]>> => {
  try {
    await assertProjectAccess({ projectId }, { ownerOnly: true });

    // Needs migrations/005_unique_identities.sql: the conflict target below is
    // the unique index it creates, and without it this query does not run.
    //
    // ON CONFLICT rather than "WHERE NOT EXISTS": the old form was a check
    // followed by an insert, so two requests could both pass the check and add
    // the same person twice. The unique index now decides.
    const query = `
      INSERT INTO
        project_user (project_id, user_id, is_user_active)
      VALUES
        ($1::UUID, $2::UUID, $3)
      ON CONFLICT (project_id, user_id) DO NOTHING
      RETURNING
        project_user_id, project_id, user_id, is_user_active
    `;

    const response = await sql.query(query, [projectId, userId, true]);

    const projectUsers: ProjectUser[] = response.rows.map((row) => ({
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      isUserActive: row.is_user_active,
    }));

    // Inserting nothing used to be returned as success, so adding someone who
    // was already on the project looked like it had worked. It is a refusal,
    // and the caller says so.
    return projectUsers.length > 0
      ? actionOk(projectUsers)
      : actionFailed("invalid", "User is already on this project");
  } catch (error) {
    return toActionFailure(error);
  }
};
