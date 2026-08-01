"use client";

// Hooks
import { usePopupMessage } from "./PopupMessage";

// Types
import { ActionResult, ActionFailureReason } from "../types/ActionResult";
import { databaseRetries } from "../types/DatabaseRetries";

// Only "error" invites a retry. Telling someone to try again after a
// permission failure sends them round a loop that cannot succeed, which is
// exactly what every handler used to do.
const FAILURE_MESSAGES: Record<ActionFailureReason, string> = {
  denied: "You do not have permission to make this change.",
  not_found: "This record no longer exists. Please refresh the page.",
  invalid: "That change is not allowed.",
  error: "Error to save. Please try again.",
};

// The previous helper polled navigator.onLine but never awaited the work it
// was given, so callers were told the save succeeded while it was still in
// flight. This waits for a connection, then actually awaits the action.
const waitForConnection = async (): Promise<boolean> => {
  for (let attempt = 0; attempt < databaseRetries; attempt++) {
    if (navigator.onLine) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.warn(`Waiting for a connection, attempt ${attempt + 1}`);
  }

  return navigator.onLine;
};

export interface SaveOptions {
  /** Defaults to "Saved". Pass null to stay silent on success. */
  successMessage?: string | null;
  /** Override the wording for particular failures. */
  failureMessages?: Partial<Record<ActionFailureReason, string>>;
}

/**
 * Runs a database action and reports the outcome, replacing the retry and
 * popup boilerplate that was repeated at every editable field.
 *
 * Returns the data on success and undefined on failure, so callers that only
 * need the happy path can stay short.
 */
export const useSaveField = () => {
  const { setMessage, setMessageType } = usePopupMessage();

  const report = (message: string, type: "regular" | "error") => {
    if (setMessage && setMessageType) {
      setMessage(message);
      setMessageType(type);
    }
  };

  const save = async <T>(
    run: () => Promise<ActionResult<T>>,
    options?: SaveOptions
  ): Promise<T | undefined> => {
    if (!(await waitForConnection())) {
      report(FAILURE_MESSAGES.error, "error");
      return undefined;
    }

    const result = await run();

    if (result.ok) {
      const successMessage =
        options?.successMessage === null
          ? null
          : options?.successMessage ?? "Saved";

      if (successMessage) {
        report(successMessage, "regular");
      }

      return result.data;
    }

    report(
      options?.failureMessages?.[result.reason] ?? FAILURE_MESSAGES[result.reason],
      "error"
    );

    return undefined;
  };

  return { save };
};
