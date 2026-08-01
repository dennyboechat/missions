/**
 * What a database action returns.
 *
 * Actions used to collapse every outcome into `undefined`, so the caller could
 * not tell a permission failure from a missing record from the database being
 * unreachable -- and the UI told users to retry things that could never
 * succeed. The reason travels with the failure so callers can say something
 * true.
 */
export type ActionFailureReason =
  /** Signed in, but not allowed to touch this project. Retrying will not help. */
  | "denied"
  /** The record does not exist, or was deleted by someone else. */
  | "not_found"
  /** The request itself was malformed, e.g. a column that may not be written. */
  | "invalid"
  /** Anything else: the database was unreachable, a constraint failed. */
  | "error";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ActionFailureReason; message?: string };

export const actionOk = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const actionFailed = <T>(
  reason: ActionFailureReason,
  message?: string
): ActionResult<T> => ({ ok: false, reason, message });

/** The data if the action succeeded, otherwise undefined. */
export const actionData = <T>(result: ActionResult<T>): T | undefined =>
  result.ok ? result.data : undefined;

/** Whether telling the user to try again is honest advice. */
export const isRetryable = (result: ActionResult<unknown>): boolean =>
  !result.ok && result.reason === "error";
