// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";

import { useLiveData } from "../useLiveData";

const INTERVAL_MS = 1000;

let visibility: DocumentVisibilityState = "visible";

const setVisibility = async (next: DocumentVisibilityState) => {
  visibility = next;

  await act(async () => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const Page = ({
  load,
  apply,
  enabled = true,
}: {
  load: () => Promise<string>;
  apply: (data: string) => void;
  enabled?: boolean;
}) => {
  useLiveData({ load, apply, enabled, intervalMs: INTERVAL_MS });
  return null;
};

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

describe("useLiveData", () => {
  it("re-reads the records on every interval", async () => {
    const load = vi.fn(async () => "records");
    const apply = vi.fn();

    render(<Page load={load} apply={apply} />);

    // The page owns its first load, so the hook waits out an interval first.
    expect(load).not.toHaveBeenCalled();

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(1);

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(2);

    expect(apply).toHaveBeenCalledWith("records");
  });

  it("stops querying while the tab is hidden and catches up on return", async () => {
    const load = vi.fn(async () => "records");

    render(<Page load={load} apply={vi.fn()} />);

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(1);

    await setVisibility("hidden");
    await advance(INTERVAL_MS * 5);

    // A tab nobody is looking at is not worth a query.
    expect(load).toHaveBeenCalledTimes(1);

    // Coming back is exactly when staleness is most obvious, so it does not
    // wait out another interval.
    await setVisibility("visible");
    expect(load).toHaveBeenCalledTimes(2);

    // And the interval is running again.
    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("re-reads as soon as the connection is back", async () => {
    const load = vi.fn(async () => "records");

    render(<Page load={load} apply={vi.fn()} />);

    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does not queue a slow query up behind itself", async () => {
    let resolveLoad: ((value: string) => void) | undefined;

    const load = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    render(<Page load={load} apply={vi.fn()} />);

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(1);

    // Three more ticks pass while the first is still in flight.
    await advance(INTERVAL_MS * 3);
    expect(load).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveLoad?.("records");
    });

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("drops a reply that arrives after the page moved on", async () => {
    let resolveLoad: ((value: string) => void) | undefined;

    const load = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    const apply = vi.fn();

    const { unmount } = render(<Page load={load} apply={apply} />);

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      resolveLoad?.("records for a patient nobody is looking at");
    });

    expect(apply).not.toHaveBeenCalled();
  });

  it("stays quiet until the page knows what it is looking at", async () => {
    const load = vi.fn(async () => "records");

    const { rerender } = render(
      <Page load={load} apply={vi.fn()} enabled={false} />,
    );

    await advance(INTERVAL_MS * 3);
    expect(load).not.toHaveBeenCalled();

    rerender(<Page load={load} apply={vi.fn()} enabled />);

    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("keeps the records on screen when a refresh fails", async () => {
    const load = vi.fn(async () => {
      throw new Error("database unreachable");
    });
    const apply = vi.fn();

    vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Page load={load} apply={apply} />);

    await advance(INTERVAL_MS);
    expect(apply).not.toHaveBeenCalled();

    // And it recovers rather than giving up on the page.
    await advance(INTERVAL_MS);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
