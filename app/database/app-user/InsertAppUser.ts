"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { AppUser, InsertAppUser } from "../../types/AppUser";

// Auth
import { getAuthenticatedUserId } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

// Validation
import { assertPresentText, assertEmailAddress } from "../validation/fieldGuards";

export const insertAppUser = async ({
  userName,
  userEmail,
}: InsertAppUser): Promise<ActionResult<AppUser>> => {
  try {
    // Pre-creates a row for someone being invited to a project, so the caller
    // must at least be an established user themselves.
    await getAuthenticatedUserId();

    const validatedUserName = assertPresentText(userName, "user_name");
    // Lowercased here, which is the only spelling the column stores.
    const validatedUserEmail = assertEmailAddress(userEmail);

    // Needs migrations/005_unique_identities.sql: the conflict target below is
    // the unique index it creates, and without it this query does not run.
    //
    // ON CONFLICT rather than "WHERE NOT EXISTS": the old form was a check
    // followed by an insert, so two invitations sent at the same moment both
    // passed the check and both inserted. Now the second one loses at the
    // unique index and returns nothing, which is what "not_found" reports.
    const query = `
      INSERT INTO
        app_user (user_name, user_email)
      VALUES
        ($1, $2::VARCHAR)
      ON CONFLICT (LOWER(user_email)) DO NOTHING
      RETURNING
        user_id, user_name, user_email
    `;

    const response = await sql.query(query, [
      validatedUserName,
      validatedUserEmail,
    ]);

    const users: AppUser[] = response.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
    }));

    return users.length > 0
      ? actionOk(users[0])
      : actionFailed("not_found");
  } catch (error) {
    return toActionFailure(error);
  }
};
