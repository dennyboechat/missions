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
  getClerkPrimaryEmail,
  getClerkUserId,
  AccessDeniedError,
} from "../auth/projectAccess";

// Validation
import { assertPresentText } from "../validation/fieldGuards";

// `field` is interpolated into the statement, so it has to come from a fixed set.
const UPDATABLE_FIELDS = ["user_third_party_id", "user_name"];

export const updateAppUser = async ({
  userEmail,
  field,
  value,
}: {
  userEmail: string;
  field: string;
  value: string | number | boolean;
}): Promise<ActionResult<User>> => {
  try {
    if (!UPDATABLE_FIELDS.includes(field)) {
      throw new AccessDeniedError(`Field not updatable: ${field}`);
    }

    // This is the sign-up path that links an invited app_user row to a Clerk
    // account. Callers may only ever link their own row: without this, anyone
    // could point another user's email at their own Clerk id and take over
    // that account along with every project it owns.
    const callerEmail = await getClerkPrimaryEmail();

    if (callerEmail.toLowerCase() !== userEmail.trim().toLowerCase()) {
      throw new AccessDeniedError("Cannot modify another user's account");
    }

    const clerkUserId = await getClerkUserId();

    if (field === "user_third_party_id" && value !== clerkUserId) {
      throw new AccessDeniedError("Cannot link an account to another session");
    }

    // Matched case-insensitively for the same reason the caller check above
    // lowercases: the address arrives from a form, the stored one is
    // normalised, and a miss here reads as "your account does not exist".
    const query = `
      UPDATE
        app_user
      SET
        ${field} = $1
      WHERE
        LOWER(user_email) = LOWER(BTRIM($2))
        -- Only a row nobody has claimed yet (an invitation) or the caller's own.
        -- Matching on email alone handed over an already-linked account, with
        -- every project it owns, to whoever next held that address in Clerk:
        -- someone who changed their Clerk email leaves the old address free
        -- for a stranger to sign up with, while app_user still stores it.
        AND (user_third_party_id IS NULL OR user_third_party_id = $3)
      RETURNING
        user_id, user_third_party_id, user_name, user_email
    `;

    const validatedValue =
      field === "user_name"
        ? assertPresentText(value as string, "user_name")
        : value;

    const response = await sql.query(query, [
      validatedValue,
      userEmail,
      clerkUserId,
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
