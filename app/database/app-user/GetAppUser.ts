"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { AppUser } from "../../types/AppUser";

// Auth
import { getClerkUserId, AccessDeniedError } from "../auth/projectAccess";

// `field` is interpolated into the statement, so it has to come from a fixed
// set. Lookup by email stays available because adding a collaborator to a
// project needs it; it is gated on being signed in.
const SEARCHABLE_FIELDS = ["user_third_party_id", "user_email"];

export const getAppUser = async ({
  field,
  value,
}: {
  field: string;
  value: string | number | boolean;
}): Promise<AppUser | undefined> => {
  try {
    if (!SEARCHABLE_FIELDS.includes(field)) {
      throw new AccessDeniedError(`Field not searchable: ${field}`);
    }

    // Only a Clerk session, not an app_user row: this runs during sign-up,
    // before that row exists.
    await getClerkUserId();

    const query = `
      SELECT 
        *
      FROM 
        app_user
      WHERE
        ${field} = $1
    `;

    const response = await sql.query(query, [value]);

    const users: AppUser[] = response.rows.map((row) => ({
      userId: row.user_id,
      userThirdPartyId: row.user_third_party_id,
      userName: row.user_name,
      userEmail: row.user_email,
    }));

    return users?.length > 0 ? users[0] : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
