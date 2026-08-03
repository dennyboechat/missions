"use client";

// Hooks
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

// Types
import { MouseEvent } from "react";

/**
 * How long a click waits to see whether another one is behind it.
 *
 * Long enough to catch a burst -- a run of clicks down the menu arrives 80-200ms
 * apart -- and short enough that the one deliberate click that follows a pause
 * is not held at all: the window only opens once a navigation has already
 * started, so a click arriving on a quiet menu goes straight through.
 */
const BURST_WINDOW_MS = 150;

/**
 * Side-menu navigation where the last click wins, and the ones before it cost
 * nothing.
 *
 * The router itself is no longer the problem it once was: a navigation dispatched
 * while another is pending marks the pending one discarded and starts
 * immediately, so commits cannot land out of order (see the ACTION_NAVIGATE
 * branch of dispatchAction in next/dist/client/components/app-router-instance).
 * What is left is the cost of having been on a page at all.
 *
 * Every read in this app is a server action, and server actions are strictly
 * serialised: callServer dispatches each one through the same router queue, and
 * a queued action only starts once the one before it has finished. A navigation
 * jumps that queue; the reads already in it do not go away. So a page the user
 * passes through on the way somewhere else does not just waste a query -- it
 * puts that query, and its presence heartbeat, in front of the query the page
 * they actually wanted is waiting on. Four tabs flicked through is six to eight
 * round trips at ~200ms each, all of them ahead of the one that matters. That is
 * the wait this fixes.
 *
 * So a burst of clicks mounts two pages, not four: the first click goes through
 * at once, because a menu that hesitates feels broken, and everything arriving
 * within BURST_WINDOW_MS of the last one replaces whatever was waiting rather
 * than navigating. When the clicks stop, the last target goes. The pages in
 * between are never mounted, never read, and never take a place in the queue.
 *
 * The highlight follows the click, not the URL: the URL only changes on commit,
 * and a menu that keeps pointing at the section being left reads as a click that
 * did not register.
 */
export const useMenuNavigation = <Item extends string>(
  activeMenuItem: Item
) => {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<Item>();

  const queuedRef = useRef<{ href: string; item: Item }>(undefined);
  const windowRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The timer fires long after the click that set it, so what it needs from
  // render -- where the URL got to, what was clicked last -- it reads through a
  // ref rather than a closure that has gone stale.
  const pathnameRef = useRef(pathname);
  const clickedHrefRef = useRef<string>(undefined);

  pathnameRef.current = pathname;

  const go = useCallback(
    (href: string, item: Item) => {
      clickedHrefRef.current = href;
      setClickedItem(item);
      startTransition(() => router.push(href));
    },
    [router]
  );

  // Read through a ref so the timer below can reach the current flush without
  // openWindow having to be rebuilt -- and torn down mid-burst -- each time.
  const flushRef = useRef<() => void>(() => {});

  const openWindow = useCallback(() => {
    clearTimeout(windowRef.current);
    windowRef.current = setTimeout(
      () => flushRef.current(),
      BURST_WINDOW_MS
    );
  }, []);

  const flush = useCallback(() => {
    windowRef.current = undefined;

    const queued = queuedRef.current;
    queuedRef.current = undefined;

    // Nothing waiting: the burst was a single click, already on its way.
    if (!queued) {
      return;
    }

    // The burst ended where it started -- down the menu and back up again. The
    // URL is already right, so there is nothing to navigate to.
    if (queued.href === pathnameRef.current) {
      setClickedItem(undefined);
      return;
    }

    go(queued.href, queued.item);
    // A burst can have a second wind. Whatever arrives in the next window
    // replaces this target the same way, rather than mounting a page on top of
    // the one just asked for.
    openWindow();
  }, [go, openWindow]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  useEffect(() => () => clearTimeout(windowRef.current), []);

  useEffect(() => {
    const isBursting =
      windowRef.current !== undefined || queuedRef.current !== undefined;

    // Once the URL says what the last click asked for, the highlight can go back
    // to being read from the URL. Handing it back while a burst is still running
    // would drag it onto the page being passed through.
    //
    // Nothing running and nothing waiting means wherever the URL says we are is
    // now the truth, including when the user got here with the back button.
    if (!isBursting || pathname === clickedHrefRef.current) {
      setClickedItem(undefined);
    }
  }, [pathname]);

  const navigate =
    (href: string, item: Item) => (event: MouseEvent<HTMLAnchorElement>) => {
      // Leave modified and non-primary clicks to the browser, so opening a
      // section in a new tab still works.
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      // Mid-burst. Take the target and leave the navigating to whoever closes
      // the window; the highlight moves now, so the menu still answers the
      // click.
      if (windowRef.current !== undefined) {
        queuedRef.current = { href, item };
        setClickedItem(item);
        openWindow();
        return;
      }

      go(href, item);
      openWindow();
    };

  return { activeItem: clickedItem ?? activeMenuItem, navigate };
};
