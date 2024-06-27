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
    const response = await sql`
      INSERT INTO 
        app_user (user_id, user_name, user_email) 
      SELECT 
        ${userId}, ${userName}, ${userEmail}
      WHERE
        NOT EXISTS (SELECT 1 FROM app_user WHERE user_id = ${userId})
      RETURNING 
        user_id, user_name, user_email
    `;

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
