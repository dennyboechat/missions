"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { User } from "../../types/UserTypes";

export const updateAppUser = async ({
  userEmail,
  field,
  value,
}: {
  userEmail: string;
  field: string;
  value: string | number | boolean;
}): Promise<User | undefined> => {
  try {
    const query = `
      UPDATE 
        app_user
      SET
        ${field} = $1
      WHERE
        user_email = $2
      RETURNING 
        user_id, user_third_party_id, user_name, user_email
    `;

    const response = await sql.query(query, [value, userEmail]);

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
