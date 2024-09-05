"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { User } from "../../types/UserTypes";

export const insertUser = async ({
  userId,
  userName,
  userEmail,
}: User): Promise<User | undefined> => {
  try {
    const query = `
      INSERT INTO 
        app_user (user_id, user_name, user_email) 
      SELECT 
        $1, $2, $3
      WHERE
        NOT EXISTS (SELECT 1 FROM app_user WHERE user_id = $4)
      RETURNING 
        user_id, user_name, user_email
    `;

    const response = await sql.query(query, [
      userId,
      userName,
      userEmail,
      userId,
    ]);

    const users: User[] = response.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
    }));

    return users?.length > 0 ? users[0] : undefined;
  } catch (error) {
    console.error(error);
  }
};
