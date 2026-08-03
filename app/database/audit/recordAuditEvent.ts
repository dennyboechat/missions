// The audit trail's write side.
//
// Called by the actions, never from the client -- not a "use server" module.
//
// Capture is at the application layer rather than in database triggers, because
// the author is the thing being recorded and the database does not know who the
// caller is. A trigger would need the actor pushed into a session variable per
// transaction, which is not reliable over a pooled connection where each
// statement may land on a different one. The cost of that choice: a change made
// straight against the database -- psql, a migration, a fix at 2am -- leaves no
// event. The trail is a record of what the app did.

// Database
import { sql } from "@vercel/postgres";

// Auth
import { getClerkUserId } from "../auth/projectAccess";

export type AuditAction = "added" | "changed" | "deleted";

/**
 * What kind of thing an event is about, in the words the app puts on screen.
 *
 * A closed set so the page can group and label without parsing, and so a typo in
 * one action does not quietly create a category of one.
 */
export type AuditEntity =
  | "patient"
  | "general appointment"
  | "dental appointment"
  | "general prescription"
  | "dental prescription"
  | "tooth"
  | "project"
  | "project user";

export interface AuditEvent {
  /** The project whose trail this belongs to. Actions have it from their access check. */
  projectId: string;
  action: AuditAction;
  entity: AuditEntity;
  /** The row touched, where there still is one. */
  entityId?: string;
  /** The patient it was about. Omitted for project-level events. */
  patientPersonalId?: string;
  /**
   * The patient's name, when the caller has it and the database no longer does.
   * Deleting a patient is the case: by the time this runs the row is gone, and
   * "deleted patient <uuid>" is exactly the event that needs a name on it.
   */
  patientName?: string;
  /**
   * The appointment, for the events that know one but not the patient behind it
   * -- a prescription and a tooth both hang off an appointment. Resolved to the
   * patient here rather than by a subselect in each caller's own statement.
   */
  patientGeneralId?: string;
  patientDentistryId?: string;
  /** For a change: the column, and what it went from and to. */
  field?: string;
  valueBefore?: unknown;
  valueAfter?: unknown;
}

/* One table holds a temperature, a drug name and a boolean, and the page only
   ever prints them, so everything is stored as text. Null and undefined are kept
   distinct from the string "null": an empty field reads as an em dash on the
   page, and "null" would read as a value somebody typed. */
const asText = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  return String(value);
};

/**
 * Records one write.
 *
 * The actor and the patient's name are resolved inside the insert rather than by
 * a prior lookup, so auditing a save costs one round trip and not three. The
 * database is remote enough that the trip is most of the cost.
 *
 * It never throws. An audit trail that can fail a clinical save is worse than a
 * gap in the trail: a clinician standing at a chair cannot act on "the audit
 * write failed", and refusing the save would lose the observation instead. A
 * failure is logged, loudly, on the server.
 *
 * Not transactional with the write it describes, for the same reason -- each
 * statement here is its own autocommit. A crash between the two leaves a write
 * with no event. Making the pair atomic means checking out a client and wrapping
 * both, which is the right change if the trail ever has to be relied on rather
 * than consulted.
 */
export const recordAuditEvent = async ({
  projectId,
  action,
  entity,
  entityId,
  patientPersonalId,
  patientName,
  patientGeneralId,
  patientDentistryId,
  field,
  valueBefore,
  valueAfter,
}: AuditEvent): Promise<void> => {
  try {
    const clerkUserId = await getClerkUserId();

    await sql.query(
      `
        INSERT INTO audit_event (
          project_id,
          actor_user_id,
          actor_name,
          action,
          entity,
          entity_id,
          patient_personal_id,
          patient_name,
          field,
          value_before,
          value_after
        )
        SELECT
          $1::uuid,
          actor.user_id,
          actor.user_name,
          $3,
          $4,
          $5::uuid,
          -- Given directly, or resolved up from whichever appointment the caller
          -- had. Coalesced rather than branched so one statement serves every
          -- caller.
          COALESCE($6::uuid, patient.patient_personal_id),
          -- The caller's name wins: it is the one that exists when the row does
          -- not.
          COALESCE($10, patient.patient_full_name),
          $7,
          $8,
          $9
        -- Anchored so the row is written even when neither join matches: an event
        -- with an unknown author is still an event, and losing it would be the
        -- one case where the trail is quietest about the thing worth knowing.
        FROM (SELECT 1) AS anchor
        LEFT JOIN (
          SELECT user_id, user_name
          FROM app_user
          WHERE user_third_party_id = $2
          ORDER BY created_at
          LIMIT 1
        ) AS actor ON TRUE
        -- The patient, reached by whichever of the three ids the caller had.
        LEFT JOIN patient_personal AS patient
          ON patient.patient_personal_id = COALESCE(
               $6::uuid,
               (SELECT patient_personal_id FROM patient_general
                 WHERE patient_general_id = $11::uuid),
               (SELECT patient_personal_id FROM patient_dentistry
                 WHERE patient_dentistry_id = $12::uuid)
             )
      `,
      [
        projectId,
        clerkUserId,
        action,
        entity,
        entityId ?? null,
        patientPersonalId ?? null,
        field ?? null,
        asText(valueBefore),
        asText(valueAfter),
        patientName ?? null,
        patientGeneralId ?? null,
        patientDentistryId ?? null,
      ],
    );
  } catch (error) {
    console.error("Audit write failed", { action, entity, entityId }, error);
  }
};
