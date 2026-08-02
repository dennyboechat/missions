"use server";

// Database
import { sql } from "@vercel/postgres";

// Types
import {
  PageViewer,
  PAGE_PRESENCE_TIMEOUT_SECONDS,
} from "../../types/PagePresence";
import { ProjectScope } from "../auth/projectAccess";

// Auth
import { assertProjectAccess, getClerkUserId } from "../auth/projectAccess";
import { toActionFailure } from "../auth/toActionFailure";

// Types
import { ActionResult, actionOk } from "../../types/ActionResult";

/**
 * Says "I am still here", and answers with everyone else who is.
 *
 * Both halves are one statement. A data-modifying CTE in Postgres always runs
 * to completion whether or not the outer query reads it, so the heartbeat and
 * the roster cost a single round trip -- which matters because this runs every
 * ten seconds per open page, and the database is remote enough that the trip is
 * most of the cost, not the query.
 *
 * The caller is resolved from the Clerk session inside the same statement
 * rather than by a prior lookup, for the same reason.
 */
export const touchPagePresence = async ({
  resourceKey,
  resourceLabel,
  scope,
}: {
  resourceKey: string;
  resourceLabel: string;
  scope: ProjectScope;
}): Promise<ActionResult<PageViewer[]>> => {
  try {
    const projectId = await assertProjectAccess(scope);
    const clerkUserId = await getClerkUserId();

    const response = await sql.query(
      `
        WITH caller AS (
          SELECT user_id FROM app_user
          WHERE user_third_party_id = $1
          ORDER BY created_at
          LIMIT 1
        ),
        heartbeat AS (
          INSERT INTO page_presence
            (user_id, project_id, resource_key, resource_label)
          SELECT caller.user_id, $2::uuid, $3, $4 FROM caller
          ON CONFLICT (user_id, resource_key) DO UPDATE
            SET resource_label = EXCLUDED.resource_label,
                last_seen_at = CURRENT_TIMESTAMP
        )
        SELECT
          app_user.user_id,
          app_user.user_name,
          page_presence.resource_label
        FROM page_presence
        JOIN app_user ON app_user.user_id = page_presence.user_id
        WHERE page_presence.resource_key = $3
          AND page_presence.last_seen_at >
              CURRENT_TIMESTAMP - ($5 || ' seconds')::interval
          -- Every row belonging to this session, not just the primary one. A
          -- Clerk id can still own more than one app_user row, and matching on
          -- one of them would list the reader as their own company.
          AND page_presence.user_id NOT IN (
            SELECT user_id FROM app_user WHERE user_third_party_id = $1
          )
        ORDER BY app_user.user_name
      `,
      [
        clerkUserId,
        projectId,
        resourceKey,
        resourceLabel,
        String(PAGE_PRESENCE_TIMEOUT_SECONDS),
      ],
    );

    const viewers: PageViewer[] = response.rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      resourceLabel: row.resource_label,
    }));

    return actionOk(viewers);
  } catch (error) {
    return toActionFailure(error);
  }
};
