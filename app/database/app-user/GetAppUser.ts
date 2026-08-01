"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { AppUser } from "../../types/AppUser";

// Auth
import { getClerkUserId, AccessDeniedError } from "../auth/projectAccess";

// Types
import {
  ActionResult,
  actionOk,
  actionFailed,
} from "../../types/ActionResult";

// Auth
import { toActionFailure } from "../auth/toActionFailure";

// The comparison is interpolated into the statement, so it has to come from a
// fixed set. Lookup by email stays available because adding a collaborator to
// a project needs it; it is gated on being signed in.
//
// Email is matched case-insensitively and trimmed. Stored values are already
// normalised, but callers pass whatever was typed into a form, and an address
// that fails to match here silently becomes a second account.
const SEARCHABLE_FIELDS: Record<string, string> = {
  user_third_party_id: "user_third_party_id = $1",
  user_email: "LOWER(user_email) = LOWER(BTRIM($1))",
};

export const getAppUser = async ({
  field,
  value,
}: {
  field: string;
  value: string | number | boolean;
}): Promise<ActionResult<AppUser>> => {
  try {
    const comparison = SEARCHABLE_FIELDS[field];

    if (!comparison) {
      throw new AccessDeniedError(`Field not searchable: ${field}`);
    }

    // Only a Clerk session, not an app_user row: this runs during sign-up,
    // before that row exists.
    await getClerkUserId();

    const query = `
      SELECT
        user_id,
        user_third_party_id,
        user_name,
        user_email
      FROM
        app_user
      WHERE
        ${comparison}
    `;

    const response = await sql.query(query, [value]);

    const users: AppUser[] = response.rows.map((row) => ({
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
