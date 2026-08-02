// Types
import { ProjectScope } from "../database/auth/projectAccess";

/**
 * A resource two people can be inside at the same time.
 *
 * The key is the record, not the tab -- everyone in one patient's file sees
 * each other whichever tab they are on -- and the label says where in it they
 * are, which is the part that says whether they are about to edit the same
 * field as you.
 */
export interface PagePresenceTarget {
  resourceKey: string;
  resourceLabel: string;
  /** Which project owns it, so the roster is authorised like every other read. */
  scope: ProjectScope;
}

/** Someone else who has the same record open. */
export interface PageViewer {
  userId: string;
  userName: string;
  /** The tab they are on, e.g. "Dental". */
  resourceLabel: string;
}

/**
 * How long a viewer survives without a heartbeat.
 *
 * Three missed beats at the ten-second refresh: long enough that a slow query
 * or a moment offline does not make someone flicker out of the header, short
 * enough that a closed laptop stops claiming to be in the room.
 */
export const PAGE_PRESENCE_TIMEOUT_SECONDS = 30;
