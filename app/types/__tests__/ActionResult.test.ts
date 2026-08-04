import { describe, it, expect } from "vitest";

import {
  ActionResult,
  actionOk,
  actionFailed,
  actionData,
  isRetryable,
} from "../ActionResult";

/**
 * The contract every database action answers on. Actions used to collapse each
 * outcome into `undefined`, so a caller could not tell "you may not do that"
 * from "the database is down" -- and told the user to try again either way.
 */
describe("actionOk", () => {
  it("carries the data and says so", () => {
    const result = actionOk({ patientPersonalId: "abc" });

    expect(result.ok).toBe(true);
    expect(actionData(result)).toEqual({ patientPersonalId: "abc" });
  });

  it("carries data that is itself falsy", () => {
    // A count of zero, an empty list and a false flag are all real answers. A
    // caller testing the payload for truth instead of reading `ok` loses them.
    expect(actionOk(0).ok).toBe(true);
    expect(actionData(actionOk(0))).toBe(0);
    expect(actionData(actionOk([]))).toEqual([]);
    expect(actionData(actionOk(false))).toBe(false);
    expect(actionData(actionOk(null))).toBe(null);
  });
});

describe("actionFailed", () => {
  it("names the reason it failed", () => {
    const result = actionFailed("denied");

    expect(result.ok).toBe(false);
    expect(result).toEqual({ ok: false, reason: "denied", message: undefined });
  });

  it("carries an optional message alongside the reason", () => {
    expect(actionFailed("invalid", "patient_full_name may not be written"))
      .toEqual({
        ok: false,
        reason: "invalid",
        message: "patient_full_name may not be written",
      });
  });

  it("has no data to read", () => {
    expect(actionData(actionFailed<string>("not_found"))).toBeUndefined();
  });
});

describe("isRetryable", () => {
  it("invites a retry only when trying again could work", () => {
    expect(isRetryable(actionFailed("error"))).toBe(true);
  });

  it("does not invite a retry for a failure that will fail the same way", () => {
    // Telling someone to try again after a permission failure sends them round a
    // loop that cannot succeed.
    expect(isRetryable(actionFailed("denied"))).toBe(false);
    expect(isRetryable(actionFailed("not_found"))).toBe(false);
    expect(isRetryable(actionFailed("invalid"))).toBe(false);
  });

  it("does not invite a retry of something that worked", () => {
    expect(isRetryable(actionOk("saved"))).toBe(false);
  });
});

describe("reading a result", () => {
  it("lets a caller narrow on ok and reach the data without a cast", () => {
    const result: ActionResult<number> = actionOk(42);

    if (result.ok) {
      expect(result.data).toBe(42);
    } else {
      throw new Error("a successful result read as a failure");
    }
  });

  it("keeps the four reasons distinct, so a caller can word each one", () => {
    const reasons = (["denied", "not_found", "invalid", "error"] as const).map(
      (reason) => {
        const result = actionFailed(reason);

        return result.ok ? undefined : result.reason;
      }
    );

    expect(new Set(reasons).size).toBe(4);
  });
});
