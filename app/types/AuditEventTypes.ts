// Types
import {
  AuditAction,
  AuditEntity,
} from "../database/audit/recordAuditEvent";

export type { AuditAction, AuditEntity };

/**
 * One line of the audit trail, as the page reads it.
 *
 * The names are the ones stored with the event, not the ones looked up now: an
 * event about a deleted patient still says whose record it was, and an event by
 * someone since removed from the project still says who made it. That is the
 * whole reason they are stored rather than joined.
 */
export interface AuditEventRecord {
  auditEventId: string;
  /** ISO instant. Formatted for display against the project's own date format. */
  occurredAt: string;
  actorName?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  patientPersonalId?: string;
  patientName?: string;
  /** The column, for a change. Turned into words for display. */
  field?: string;
  valueBefore?: string;
  valueAfter?: string;
}

export interface AuditEventPage {
  events: AuditEventRecord[];
  /** Whether another page exists, so the caller can offer to read further. */
  hasMore: boolean;
}
