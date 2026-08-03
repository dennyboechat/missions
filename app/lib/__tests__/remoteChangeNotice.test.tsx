// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";

import { useLiveData } from "../useLiveData";
import { markLocalWrite } from "../localWrites";

const INTERVAL_MS = 1000;

let visibility: DocumentVisibilityState = "visible";

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const Page = ({ load }: { load: () => Promise<string> }) => {
  const { hasRemoteChange, acknowledgeRemoteChange } = useLiveData({
    load,
    apply: () => {},
    intervalMs: INTERVAL_MS,
    detectChanges: true,
  });

  return (
    <button onClick={acknowledgeRemoteChange}>
      {hasRemoteChange ? "changed" : "quiet"}
    </button>
  );
};

const state = () => screen.getByRole("button").textContent;

beforeEach(() => {
  vi.useFakeTimers();
  visibility = "visible";

  vi.spyOn(document, "visibilityState", "get").mockImplementation(
    () => visibility,
  );
});

afterEach(() => {
  cleanup();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useLiveData change detection", () => {
  it("says nothing on the first refresh", async () => {
    const load = vi.fn(async () => "records");

    render(<Page load={load} />);
    await advance(INTERVAL_MS);

    // The page's own first load does not come through the hook, so the first
    // refresh is the baseline. Announcing here would mean announcing a change on
    // arrival at every page.
    expect(state()).toBe("quiet");
  });

  it("says nothing while the records keep coming back the same", async () => {
    render(<Page load={vi.fn(async () => "records")} />);

    await advance(INTERVAL_MS * 4);

    expect(state()).toBe("quiet");
  });

  it("speaks up when a refresh brings different records", async () => {
    let records = "records";
    const load = vi.fn(async () => records);

    render(<Page load={load} />);
    await advance(INTERVAL_MS);

    records = "records, plus a weight somebody else typed";
    await advance(INTERVAL_MS);

    expect(state()).toBe("changed");
  });

  it("stays quiet when the change was this tab's own save", async () => {
    let records = "records";
    const load = vi.fn(async () => records);

    render(<Page load={load} />);
    await advance(INTERVAL_MS);

    // What a save looks like from here: useSaveField marks the write, and the
    // next refresh brings back data that differs because of it.
    markLocalWrite();
    records = "records, plus the weight I just typed";
    await advance(INTERVAL_MS);

    expect(state()).toBe("quiet");
  });

  it("goes back to watching after this tab's own save", async () => {
    let records = "records";
    const load = vi.fn(async () => records);

    render(<Page load={load} />);
    await advance(INTERVAL_MS);

    markLocalWrite();
    records = "mine";
    await advance(INTERVAL_MS);
    expect(state()).toBe("quiet");

    // One suppressed refresh, not a permanent one: the next change is somebody
    // else's again.
    records = "theirs";
    await advance(INTERVAL_MS);
    expect(state()).toBe("changed");
  });

  it("can be dismissed, and speaks up again on the next change", async () => {
    let records = "records";
    const load = vi.fn(async () => records);

    render(<Page load={load} />);
    await advance(INTERVAL_MS);

    records = "theirs";
    await advance(INTERVAL_MS);
    expect(state()).toBe("changed");

    await act(async () => {
      screen.getByRole("button").click();
    });
    expect(state()).toBe("quiet");

    records = "theirs again";
    await advance(INTERVAL_MS);
    expect(state()).toBe("changed");
  });

  it("stays quiet for a caller that did not ask", async () => {
    let records = "records";

    const Unwatched = () => {
      const { hasRemoteChange } = useLiveData({
        load: async () => records,
        apply: () => {},
        intervalMs: INTERVAL_MS,
      });

      return <span>{hasRemoteChange ? "changed" : "quiet"}</span>;
    };

    render(<Unwatched />);
    await advance(INTERVAL_MS);

    records = "different";
    await advance(INTERVAL_MS);

    // The presence roster uses this hook too, and a colleague opening a page is
    // not news about the records.
    expect(screen.getByText("quiet")).toBeTruthy();
  });
});
