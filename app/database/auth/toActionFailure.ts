// Types
import {
  ActionResult,
  actionFailed,
  ActionFailureReason,
} from "../../types/ActionResult";

// Auth
import { AccessDeniedError } from "./projectAccess";

// Validation
import { InvalidInputError } from "../validation/fieldGuards";

/**
 * Turns whatever an action threw into a typed failure.
 *
 * Access denials become "denied" so the UI stops telling people to retry
 * something that will never succeed; rejected payloads and column names become
 * "invalid"; everything else stays "error".
 */
export const toActionFailure = <T>(error: unknown): ActionResult<T> => {
  console.error(error);

  let reason: ActionFailureReason = "error";

  if (error instanceof AccessDeniedError) {
    reason = "denied";
  } else if (
    error instanceof InvalidInputError ||
    (error instanceof Error &&
      /not updatable|not searchable/i.test(error.message))
  ) {
    reason = "invalid";
  }

  // The message stays in the server log above and never reaches the client: it
  // can name internal ids, column names and raw database errors. A denial that
  // named the project owning a record told anyone holding a patient's id --
  // from a photographed QR code, say -- that the record exists and which
  // mission it belongs to.
  return actionFailed<T>(reason);
};
