// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { useEffect } from "react";

import { useSaveField } from "../useSaveField";
import { PopupMessageProvider, usePopupMessage } from "../PopupMessage";
import { getLocalWriteCount } from "../localWrites";
import { actionOk, actionFailed, ActionResult } from "../../types/ActionResult";
import { databaseRetries } from "../../types/DatabaseRetries";

type Save = ReturnType<typeof useSaveField>["save"];

let fieldSave: Save | undefined;

/** How many distinct saves the mounted field has handed out. */
let savesHandedOut = 0;

/**
 * Called from an effect, so the test holds the save without the component
 * writing to anything it does not own.
 */
const holdSave = (save: Save) => {
  fieldSave = save;
  savesHandedOut += 1;
};

/**
 * A field that saves, and the popup the user reads afterwards. The message goes
 * into the DOM rather than into a variable, so the assertions read what was
 * actually rendered.
 */
const Field = ({ onSave }: { onSave: (save: Save) => void }) => {
  const { save } = useSaveField();
  const { message, messageType } = usePopupMessage();

  useEffect(() => {
    onSave(save);
  }, [onSave, save]);

  return (
    <>
      <span data-testid="message">{message ?? ""}</span>
      <span data-testid="messageType">{messageType ?? ""}</span>
    </>
  );
};

const mountField = () =>
  render(
    <PopupMessageProvider>
      <Field onSave={holdSave} />
    </PopupMessageProvider>
  );

/** What the user was told, or undefined if they were told nothing. */
const message = () => screen.getByTestId("message").textContent || undefined;

const messageType = () => screen.getByTestId("messageType").textContent || undefined;

const save: Save = (run, options) => fieldSave!(run, options);

const runSave = async <T,>(
  run: () => Promise<ActionResult<T>>,
  options?: Parameters<Save>[1]
) => {
  let result: T | undefined;

  await act(async () => {
    result = (await save(run, options)) as T | undefined;
  });

  return result;
};

beforeEach(() => {
  fieldSave = undefined;
  savesHandedOut = 0;

  // jsdom reports a connection; the offline tests override it.
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useSaveField on success", () => {
  it("hands back the data the action returned", async () => {
    mountField();

    const saved = await runSave(async () => actionOk({ patientWeight: 70 }));

    expect(saved).toEqual({ patientWeight: 70 });
  });

  it("says Saved, in the ordinary tone", async () => {
    mountField();

    await runSave(async () => actionOk("done"));

    expect(message()).toBe("Saved");
    expect(messageType()).toBe("regular");
  });

  it("says what the caller asked it to say instead", async () => {
    mountField();

    await runSave(async () => actionOk("done"), { successMessage: "Appointment added" });

    expect(message()).toBe("Appointment added");
  });

  it("stays silent when the caller passes null, for a field that saves as it is typed", async () => {
    // A popup per keystroke is noise. Null is how a caller opts out, and is why
    // it is distinct from leaving successMessage off.
    mountField();

    await runSave(async () => actionOk("done"), { successMessage: null });

    expect(message()).toBeUndefined();
  });

  it("counts the write, so the page does not read its own edit as a colleague's", async () => {
    mountField();

    const before = getLocalWriteCount();

    await runSave(async () => actionOk("done"));

    expect(getLocalWriteCount()).toBe(before + 1);
  });

  it("hands back data that is itself falsy rather than reading it as a failure", async () => {
    mountField();

    expect(await runSave(async () => actionOk(0))).toBe(0);
    expect(await runSave(async () => actionOk(false))).toBe(false);
    expect(await runSave(async () => actionOk(""))).toBe("");
  });

  it("waits for the action before saying anything", async () => {
    // The helper this replaced polled the connection but never awaited the work,
    // so a user was told "Saved" while the write was still in flight.
    mountField();

    let settle: (result: ActionResult<string>) => void = () => {};
    const run = () => new Promise<ActionResult<string>>((resolve) => { settle = resolve; });

    let finished = false;
    const saving = act(async () => {
      await save(run);
      finished = true;
    });

    await Promise.resolve();
    expect(finished).toBe(false);
    expect(message()).toBeUndefined();

    settle(actionOk("done"));
    await saving;

    expect(finished).toBe(true);
    expect(message()).toBe("Saved");
  });
});

describe("useSaveField on failure", () => {
  it("gives up the data and reports the failure", async () => {
    mountField();

    const saved = await runSave(async () => actionFailed<string>("error"));

    expect(saved).toBeUndefined();
    expect(messageType()).toBe("error");
  });

  it("words each failure as the thing that actually happened", async () => {
    mountField();

    await runSave(async () => actionFailed<string>("denied"));
    expect(message()).toBe("You do not have permission to make this change.");

    await runSave(async () => actionFailed<string>("not_found"));
    expect(message()).toBe("This record no longer exists. Please refresh the page.");

    await runSave(async () => actionFailed<string>("invalid"));
    expect(message()).toBe("That change is not allowed.");

    await runSave(async () => actionFailed<string>("error"));
    expect(message()).toBe("Error to save. Please try again.");
  });

  it("only invites a retry where trying again could work", async () => {
    mountField();

    for (const reason of ["denied", "not_found", "invalid"] as const) {
      await runSave(async () => actionFailed<string>(reason));

      // Every handler used to say this, sending a user without permission round
      // a loop that could not succeed.
      expect(message()).not.toMatch(/try again/i);
    }

    await runSave(async () => actionFailed<string>("error"));
    expect(message()).toMatch(/try again/i);
  });

  it("lets the caller reword one failure without restating the others", async () => {
    mountField();

    await runSave(async () => actionFailed<string>("not_found"), {
      failureMessages: { not_found: "That appointment has been deleted." },
    });
    expect(message()).toBe("That appointment has been deleted.");

    await runSave(async () => actionFailed<string>("denied"), {
      failureMessages: { not_found: "That appointment has been deleted." },
    });
    expect(message()).toBe("You do not have permission to make this change.");
  });

  it("does not count a failed write", async () => {
    mountField();

    const before = getLocalWriteCount();

    await runSave(async () => actionFailed<string>("denied"));

    expect(getLocalWriteCount()).toBe(before);
  });

  it("says nothing reassuring on the way to a failure", async () => {
    mountField();

    await runSave(async () => actionFailed<string>("denied"), {
      successMessage: "Appointment added",
    });

    expect(message()).not.toBe("Appointment added");
    expect(messageType()).toBe("error");
  });
});

describe("useSaveField with no connection", () => {
  it("waits for the connection to come back, then saves", async () => {
    vi.useFakeTimers();
    mountField();

    const onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const run = vi.fn(async () => actionOk("done"));

    let saved: string | undefined;
    const saving = act(async () => {
      saved = await save(run);
    });

    // Nothing is attempted while the device is offline.
    await vi.advanceTimersByTimeAsync(2500);
    expect(run).not.toHaveBeenCalled();

    onLine.mockReturnValue(true);
    await vi.advanceTimersByTimeAsync(1000);
    await saving;

    expect(run).toHaveBeenCalledTimes(1);
    expect(saved).toBe("done");
    expect(message()).toBe("Saved");
  });

  it("gives up after the agreed number of attempts and says so", async () => {
    vi.useFakeTimers();
    mountField();

    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const run = vi.fn(async () => actionOk("done"));

    let saved: string | undefined;
    const saving = act(async () => {
      saved = await save(run);
    });

    await vi.advanceTimersByTimeAsync(databaseRetries * 1000 + 1000);
    await saving;

    // The action is never run, so nothing is half-written, and the user is told
    // the save did not happen rather than left to assume it did.
    expect(run).not.toHaveBeenCalled();
    expect(saved).toBeUndefined();
    expect(message()).toBe("Error to save. Please try again.");
    expect(messageType()).toBe("error");
  });
});

describe("useSaveField identity", () => {
  it("hands back the same save across renders, so a debounce effect does not restart", async () => {
    // Several callers debounce inside a useEffect and list save as a dependency.
    // An unstable identity re-runs those effects on every render, which reissues
    // the save that was being debounced.
    const { rerender } = mountField();

    expect(savesHandedOut).toBe(1);

    rerender(
      <PopupMessageProvider>
        <Field onSave={holdSave} />
      </PopupMessageProvider>
    );

    // The effect that takes the save lists it as a dependency, so a second
    // hand-out would mean a second identity -- and every debounce effect that
    // depends on save would have restarted with it.
    expect(savesHandedOut).toBe(1);

    // Still the same one after a save has been through, which re-renders the
    // provider with a message and would rebuild an unmemoised callback.
    await runSave(async () => actionOk("done"));
    rerender(
      <PopupMessageProvider>
        <Field onSave={holdSave} />
      </PopupMessageProvider>
    );

    expect(savesHandedOut).toBe(1);
  });
});
