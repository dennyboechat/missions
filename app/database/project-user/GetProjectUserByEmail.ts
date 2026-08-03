"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";
import { ProjectId } from "../../types/ProjectTypes";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";

// Types
import { ActionResult, actionOk } from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

/**
 * The user already on this project under the given email, if there is one.
 *
 * An account is keyed by its email, and a project holds a given account once, so
 * this answers with a row or with nothing -- never with a list. It is what lets
 * the new-user form refuse a second entry for someone who is already here,
 * before anything is written.
 *
 * Scoped to the project, like the by-name lookup beside it: the caller can
 * already read every name and email on this project, and answering for accounts
 * outside it would turn the form into a way to test whether an address is
 * registered.
 *
 * The comparison ignores case and surrounding spaces, which is how the address
 * is stored and how it is compared everywhere else.
 */
export const getProjectUserByEmail = async ({
  projectId,
  userEmail,
}: {
  projectId: ProjectId;
  userEmail: string;
}): Promise<ActionResult<ProjectUser | undefined>> => {
  try {
    await assertProjectAccess({ projectId }, { requires: "admin" });

    const trimmedUserEmail = userEmail.trim();

    if (trimmedUserEmail === "") {
      return actionOk(undefined);
    }

    const query = `
      SELECT
        project_user.project_user_id,
        project_user.project_id,
        project_user.user_id,
        project_user.is_user_active,
        project_user.is_user_admin,
        app_user.user_name,
        app_user.user_email
      FROM
        project_user
      INNER JOIN
        app_user ON app_user.user_id = project_user.user_id
      WHERE
        project_user.project_id = $1
        AND LOWER(TRIM(app_user.user_email)) = LOWER($2)
      LIMIT 1
    `;

    const response = await sql.query(query, [projectId, trimmedUserEmail]);
    const [row] = response.rows;

    if (!row) {
      return actionOk(undefined);
    }

    const projectUser: ProjectUser = {
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      isUserActive: row.is_user_active,
      isUserAdmin: row.is_user_admin,
    };

    return actionOk(projectUser);
  } catch (error) {
    return toActionFailure(error);
  }
};
