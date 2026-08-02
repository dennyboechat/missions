"use client";

// Hooks
import { useCallback, useEffect, useRef } from "react";

/**
 * How often an open page re-reads its records.
 *
 * Ten seconds is the compromise a clinic wants: two clinicians on the same
 * patient see each other within a breath, and a page left open costs six
 * queries a minute -- and none at all once the tab is hidden.
 */
export const LIVE_DATA_INTERVAL_MS = 10_000;

interface UseLiveDataOptions<T> {
  /** Re-reads the records. Usually the same database action the page loaded with. */
  load: () => Promise<T>;
  /** Applies what came back. Must tolerate being called repeatedly with unchanged data. */
  apply: (data: T) => void;
  /** Skip polling until the page knows what it is looking at. */
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Keeps a page's records in step with the database while it sits open.
 *
 * Why polling and not a socket: the app is served by Vercel functions, which
 * are never handed the HTTP upgrade, so this repo cannot host a WebSocket
 * server. A server-sent-events route would stream, but it pins a function
 * invocation per open tab and a write landing on another instance still could
 * not reach it without an external broker. Asking the database directly, only
 * while someone is looking, costs less than either and needs no new service.
 *
 * The reads are the page's own server actions, so every refresh goes through
 * the same authorisation check as the first load.
 *
 * This handles refreshes only -- the page keeps its own first load. They are
 * not the same event: a first load also decides which appointment tab opens
 * and clears the loading state, and doing that again every ten seconds would
 * throw the user back to the newest tab while they were reading an older one.
 *
 * Callers stay responsible for not overwriting a field someone is editing.
 * See useLiveValue.
 */
export const useLiveData = <T,>({
  load,
  apply,
  enabled = true,
  intervalMs = LIVE_DATA_INTERVAL_MS,
}: UseLiveDataOptions<T>) => {
  // Read through refs so that a caller passing inline functions -- which is
  // every caller -- does not tear the timer down and rebuild it on each render.
  const loadRef = useRef(load);
  const applyRef = useRef(apply);

  useEffect(() => {
    loadRef.current = load;
    applyRef.current = apply;
  });

  // Bumped whenever the effect is torn down, so a reply that arrives after the
  // page moved on is dropped rather than written over the new records.
  const generationRef = useRef(0);
  const isLoadingRef = useRef(false);

  const refresh = useCallback(async () => {
    // A slow query must not queue up behind itself. Skipping is safe: the next
    // tick is ten seconds away and asks the same question.
    if (isLoadingRef.current) {
      return;
    }

    const generation = generationRef.current;
    isLoadingRef.current = true;

    try {
      const data = await loadRef.current();

      if (generation === generationRef.current) {
        applyRef.current(data);
      }
    } catch (error) {
      // A failed refresh is not worth interrupting anyone over -- the records
      // already on screen stay, and the next tick tries again.
      console.warn("Live refresh failed", error);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const stopPolling = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const startPolling = () => {
      stopPolling();
      intervalId = setInterval(refresh, intervalMs);
    };

    // A hidden tab is not worth a query. Coming back to one is worth an
    // immediate query: waiting out the interval is the case where staleness is
    // most obvious, because the user knows they have been away.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", refresh);

    return () => {
      generationRef.current += 1;
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", refresh);
    };
  }, [enabled, intervalMs, refresh]);

  return { refresh };
};
