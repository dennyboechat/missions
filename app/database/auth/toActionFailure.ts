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

  // The message is for logs and developers, not for display: it can name
  // internal ids and column names.
  return actionFailed<T>(
    reason,
    error instanceof Error ? error.message : undefined
  );
};
