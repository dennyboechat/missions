"use client";

// Hooks
import { useCallback, useEffect, useState } from "react";
import { useLiveData } from "./useLiveData";

// Database
import { touchPagePresence } from "../database/page-presence/TouchPagePresence";
import { clearPagePresence } from "../database/page-presence/ClearPagePresence";

// Types
import { PagePresenceTarget, PageViewer } from "../types/PagePresence";
import { actionData } from "../types/ActionResult";

/**
 * Announces that this page is open, and reports who else has it open.
 *
 * The heartbeat rides the same ten-second beat as the data refresh, and for the
 * same reason: it is one query, so saying "still here" and asking "who else"
 * costs no more than asking. It also inherits the useful half of that hook's
 * behaviour for free -- a hidden tab stops beating, so it drops out of everyone
 * else's header within the timeout. That is the right answer rather than a
 * convenient one: a page buried behind twelve others is not somewhere anybody
 * is about to type.
 *
 * Nothing here is an audit trail. It forgets after thirty seconds of silence
 * and keeps no history of who was where.
 */
export const usePagePresence = (target?: PagePresenceTarget) => {
  const [viewers, setViewers] = useState<PageViewer[]>([]);

  const resourceKey = target?.resourceKey;
  const resourceLabel = target?.resourceLabel;
  const scope = target?.scope;

  const heartbeat = useCallback(
    () =>
      touchPagePresence({
        resourceKey: resourceKey ?? "",
        resourceLabel: resourceLabel ?? "",
        scope: scope ?? {},
      }),
    [resourceKey, resourceLabel, scope],
  );

  const { refresh } = useLiveData({
    load: heartbeat,
    apply: (result) => setViewers(actionData(result) ?? []),
    enabled: Boolean(resourceKey),
  });

  // Arriving is worth announcing at once. Waiting out the interval would leave
  // a colleague invisible for the ten seconds in which someone is most likely
  // to start typing over them.
  useEffect(() => {
    if (!resourceKey) {
      setViewers([]);
      return;
    }

    refresh();
  }, [resourceKey, resourceLabel, refresh]);

  // Leaving, likewise -- best effort, since no browser reliably runs anything
  // as a tab closes. The timeout is what actually removes people; this only
  // makes the ordinary cases immediate.
  useEffect(() => {
    if (!resourceKey) {
      return;
    }

    const leave = () => {
      clearPagePresence({ resourceKey });
    };

    const onPageHide = () => leave();

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      // Navigating between records ends this page too, and unlike a closing tab
      // it is something the app can be certain about.
      leave();
    };
  }, [resourceKey]);

  return { viewers };
};
