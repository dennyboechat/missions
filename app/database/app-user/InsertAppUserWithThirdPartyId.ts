"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { User } from "../../types/UserTypes";

// Auth
import {
  getClerkUserId,
  getClerkPrimaryEmail,
} from "../auth/projectAccess";

export const insertAppUserWithThirdPartyId = async ({
  userName,
}: {
  userName: string;
}): Promise<User | undefined> => {
  try {
    // Identity comes from the session, not the request, so a caller cannot
    // register a row under someone else's Clerk id or email address.
    const userThirdPartyId = await getClerkUserId();
    const userEmail = await getClerkPrimaryEmail();

    const query = `
      INSERT INTO 
        app_user (user_third_party_id, user_name, user_email) 
      SELECT 
        $1::VARCHAR, $2, $3::VARCHAR
      WHERE
        NOT EXISTS (SELECT 1 FROM app_user WHERE user_third_party_id = $1 OR user_email = $3)
      RETURNING 
        user_id, user_third_party_id, user_name, user_email
    `;

    const response = await sql.query(query, [
      userThirdPartyId,
      userName,
      userEmail,
    ]);

    const users: User[] = response.rows.map((row) => ({
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
