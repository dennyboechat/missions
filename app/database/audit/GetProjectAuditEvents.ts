"use server";

// Database
import { sql } from "@vercel/postgres";

// Auth
import { assertProjectAccess } from "../auth/projectAccess";
import { toActionFailure } from "../auth/toActionFailure";

// Types
import { ActionResult, actionOk } from "../../types/ActionResult";
import { ProjectId } from "../../types/ProjectTypes";
import {
  AuditEventPage,
  AuditEventRecord,
} from "../../types/AuditEventTypes";

/**
 * How many events a page of the trail holds.
 *
 * One row per field save means a single busy appointment can fill a screen, so
 * the page is sized to be read rather than to be complete. Anything larger is a
 * scroll nobody finishes.
 */
const PAGE_SIZE = 50;

/**
 * One project's audit trail, newest first.
 *
 * Admin only, and the check is here rather than in the page: the action is an
 * HTTP endpoint, so hiding the menu item restricts nothing. A member calling this
 * with a project id gets "denied", which is the whole of the protection.
 *
 * Scoped to the project the caller named, which is also the tenant boundary --
 * there is no cross-project view of the trail, by design. An admin of one mission
 * has no standing in another.
 *
 * Paged on an offset rather than a cursor. The trail is read from the top and
 * followed backwards a page at a time; an event arriving mid-read shifts the
 * boundary by one row, which is the kind of imprecision a keyset cursor solves
 * and this reader does not need.
 */
export const getProjectAuditEvents = async ({
  projectId,
  page = 0,
  patientPersonalId,
  action,
}: {
  projectId: ProjectId;
  page?: number;
  /** Narrow to one patient's history. */
  patientPersonalId?: string;
  /** Narrow to additions, changes or deletions. */
  action?: string;
}): Promise<ActionResult<AuditEventPage>> => {
  try {
    await assertProjectAccess({ projectId }, { requires: "admin" });

    const offset = Math.max(0, Math.trunc(page)) * PAGE_SIZE;

    // Both filters are optional and both are parameters, so the statement is one
    // shape whatever is asked for -- no fragments assembled from input.
    const query = `
      SELECT
        audit_event_id,
        created_at,
        actor_name,
        action,
        entity,
        entity_id,
        patient_personal_id,
        patient_name,
        field,
        value_before,
        value_after
      FROM
        audit_event
      WHERE
        project_id = $1
        AND ($2::uuid IS NULL OR patient_personal_id = $2::uuid)
        AND ($3::text IS NULL OR action = $3::text)
      ORDER BY
        created_at DESC,
        -- A tiebreaker, because a dozen field saves can share a timestamp to the
        -- millisecond and a page boundary drawn through them would otherwise
        -- repeat or drop rows.
        audit_event_id DESC
      LIMIT $4
      OFFSET $5
    `;

    const response = await sql.query(query, [
      projectId,
      patientPersonalId ?? null,
      action ?? null,
      // One more than the page, which is how "is there another page" is answered
      // without a second count query over a table that only grows.
      PAGE_SIZE + 1,
      offset,
    ]);

    const rows = response.rows.slice(0, PAGE_SIZE);

    const events: AuditEventRecord[] = rows.map((row) => ({
      auditEventId: row.audit_event_id,
      occurredAt: new Date(row.created_at).toISOString(),
      actorName: row.actor_name ?? undefined,
      action: row.action,
      entity: row.entity,
      entityId: row.entity_id ?? undefined,
      patientPersonalId: row.patient_personal_id ?? undefined,
      patientName: row.patient_name ?? undefined,
      field: row.field ?? undefined,
      valueBefore: row.value_before ?? undefined,
      valueAfter: row.value_after ?? undefined,
    }));

    return actionOk({
      events,
      hasMore: response.rows.length > PAGE_SIZE,
    });
  } catch (error) {
    return toActionFailure(error);
  }
};
