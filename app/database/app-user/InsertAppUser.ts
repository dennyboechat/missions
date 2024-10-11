"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { AppUser, InsertAppUser } from "../../types/AppUser";

export const insertAppUser = async ({
  userName,
  userEmail,
}: InsertAppUser): Promise<AppUser | undefined> => {
  try {
    const query = `
      INSERT INTO 
        app_user (user_name, user_email)
      SELECT 
        $1, $2::VARCHAR
      WHERE
        NOT EXISTS (SELECT 1 FROM app_user WHERE user_email = $2)
      RETURNING 
        user_id, user_name, user_email
    `;

    const response = await sql.query(query, [userName, userEmail]);

    const users: AppUser[] = response.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
    }));

    return users?.length > 0 ? users[0] : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
