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
 * Users already on the project registered under the given name, so the form
 * can warn about a possible duplication before another one is added.
 *
 * Deliberately scoped to the project rather than to app_user as a whole. The
 * caller is the project owner, who can already see every name and email on
 * this list; searching all users by name would instead let them read the email
 * of anyone in the system whose name they can guess.
 *
 * The comparison ignores case and surrounding spaces.
 */
export const getProjectUsersByName = async ({
  projectId,
  userName,
}: {
  projectId: ProjectId;
  userName: string;
}): Promise<ActionResult<ProjectUser[]>> => {
  try {
    await assertProjectAccess({ projectId }, { requires: "admin" });

    const trimmedUserName = userName.trim();

    if (trimmedUserName === "") {
      return actionOk([]);
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
        AND LOWER(TRIM(app_user.user_name)) = LOWER($2)
      ORDER BY
        app_user.user_email
    `;

    const response = await sql.query(query, [projectId, trimmedUserName]);

    const projectUsers: ProjectUser[] = response.rows.map((row) => ({
      projectUserId: row.project_user_id,
      projectId: row.project_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      isUserActive: row.is_user_active,
      isUserAdmin: row.is_user_admin,
    }));

    return actionOk(projectUsers);
  } catch (error) {
    return toActionFailure(error);
  }
};
