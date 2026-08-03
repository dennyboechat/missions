"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser, UpdateProjectUser } from "../../types/ProjectUserTypes";

// Auth
import {
  assertProjectAccess,
  getAuthenticatedUserIds,
} from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

export const updateProjectUser = async ({
  projectUserId,
  isUserActive,
  isUserAdmin,
}: UpdateProjectUser): Promise<ActionResult<ProjectUser>> => {
  try {
    await assertProjectAccess({ projectUserId }, { requires: "admin" });

    // Nobody edits their own membership row, admin or not.
    //
    // An admin who switched off their own admin -- or their own active flag --
    // would revoke the access they are using mid-action and land on a page they
    // may no longer load. Someone else with the rank does it, which for the
    // last admin means the owner, who cannot be locked out because ownership is
    // not held in this table.
    //
    // Checked here and not only in the UI: every one of these actions is an
    // HTTP endpoint, so a disabled switch restricts nothing.
    const callerUserIds = await getAuthenticatedUserIds();

    const ownRow = await sql.query(
      `SELECT 1 FROM project_user
       WHERE project_user_id = $1::uuid AND user_id = ANY($2::uuid[])`,
      [projectUserId, callerUserIds]
    );

    if (ownRow.rows.length > 0) {
      return actionFailed(
        "invalid",
        "You cannot change your own access. Ask the project owner or another admin."
      );
    }

    // COALESCE so an unspecified flag keeps whatever is on the row, rather than
    // being nulled out by a caller that only meant to change the other one.
    const query = `
      UPDATE
        project_user
      SET
        is_user_active = COALESCE($1, is_user_active),
        is_user_admin = COALESCE($2, is_user_admin)
      WHERE
        project_user_id = $3
      RETURNING
        project_user_id, project_id, user_id, is_user_active, is_user_admin
    `;

    const response = await sql.query(query, [
      isUserActive ?? null,
      isUserAdmin ?? null,
      projectUserId,
    ]);

    const projectUsers: ProjectUser[] = response.rows.map((row) => ({
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      isUserActive: row.is_user_active,
      isUserAdmin: row.is_user_admin,
    }));

    return projectUsers.length > 0
      ? actionOk(projectUsers[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
