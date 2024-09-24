"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import { AppUser } from "../../types/AppUser";

export const getAppUser = async ({
  field,
  value,
}: {
  field: string;
  value: string | number | boolean;
}): Promise<AppUser | undefined> => {
  try {
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
  }
};
