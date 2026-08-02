"use server";

// Database
import { sql } from "@vercel/postgres";

// Auth
import { getClerkUserId } from "../auth/projectAccess";
import { toActionFailure } from "../auth/toActionFailure";

// Types
import { ActionResult, actionOk } from "../../types/ActionResult";

/**
 * Leaves a page, so the people still on it stop seeing a name that is no longer
 * there.
 *
 * Best effort only. A browser gives no reliable promise that anything runs when
 * a tab closes, a laptop lid shuts, or a connection drops mid-mission, so the
 * thirty-second timeout is what actually guarantees a departure -- this only
 * makes the common cases immediate.
 *
 * No project check: the statement can only ever delete the caller's own row,
 * which is the same authority as closing the tab.
 */
export const clearPagePresence = async ({
  resourceKey,
}: {
  resourceKey: string;
}): Promise<ActionResult<null>> => {
  try {
    const clerkUserId = await getClerkUserId();

    await sql.query(
      `
        DELETE FROM page_presence
        WHERE resource_key = $2
          AND user_id IN (
            SELECT user_id FROM app_user WHERE user_third_party_id = $1
          )
      `,
      [clerkUserId, resourceKey],
    );

    return actionOk(null);
  } catch (error) {
    return toActionFailure(error);
  }
};
