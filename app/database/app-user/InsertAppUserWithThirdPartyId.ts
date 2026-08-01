"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { User } from "../../types/UserTypes";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

// Auth
import {
  getClerkUserId,
  getClerkPrimaryEmail,
} from "../auth/projectAccess";

// Validation
import { assertPresentText, assertEmailAddress } from "../validation/fieldGuards";

export const insertAppUserWithThirdPartyId = async ({
  userName,
}: {
  userName: string;
}): Promise<ActionResult<User>> => {
  try {
    // Identity comes from the session, not the request, so a caller cannot
    // register a row under someone else's Clerk id or email address.
    const userThirdPartyId = await getClerkUserId();
    const userEmail = assertEmailAddress(await getClerkPrimaryEmail());
    const validatedUserName = assertPresentText(userName, "user_name");

    // Needs migrations/005_unique_identities.sql: the conflict target below is
    // the unique index it creates, and without it this query does not run.
    //
    // Two conflicts are possible -- the Clerk id and the email -- and
    // ON CONFLICT names only one, so the email is the one declared and the
    // Clerk id keeps its WHERE NOT EXISTS. Both are now backed by a unique
    // index, so a race that beats the check raises rather than duplicating,
    // and comes back as a failure instead of a second account.
    const query = `
      INSERT INTO
        app_user (user_third_party_id, user_name, user_email)
      SELECT
        $1::VARCHAR, $2, $3::VARCHAR
      WHERE
        NOT EXISTS (SELECT 1 FROM app_user WHERE user_third_party_id = $1)
      ON CONFLICT (LOWER(user_email)) DO NOTHING
      RETURNING
        user_id, user_third_party_id, user_name, user_email
    `;

    const response = await sql.query(query, [
      userThirdPartyId,
      validatedUserName,
      userEmail,
    ]);

    const users: User[] = response.rows.map((row) => ({
      userId: row.user_id,
      userThirdPartyId: row.user_third_party_id,
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
