"use client";

// Hooks
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

// Types
import { MouseEvent } from "react";

/**
 * Side-menu navigation where the last click wins.
 *
 * Handing every click straight to the router queues them all, and the router
 * commits each one when that navigation's own work finishes rather than in the
 * order they were made. A section that renders slowly therefore lands *after* a
 * section clicked later, and the screen settles on an item you left two clicks
 * ago -- or flashes through it on the way. Rendering a record takes long enough
 * for a second click to arrive well inside that window.
 *
 * So only one navigation is ever in flight. A click made while one is running
 * does not start a second: it replaces whatever was waiting, and starts once
 * the running one settles. Older targets are dropped rather than queued, which
 * is what makes the last click the one that counts.
 *
 * The highlight follows the click rather than the URL, which only changes on
 * commit -- otherwise the menu keeps pointing at the section being left, and
 * any stale commit on the way drags the highlight backwards with it.
 */
export const useMenuNavigation = <Item extends string>(
  activeMenuItem: Item
) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<Item>();
  const queuedRef = useRef<{ href: string; item: Item }>(undefined);

  const go = useCallback(
    (href: string, item: Item) => {
      setClickedItem(item);
      startTransition(() => router.push(href));
    },
    [router]
  );

  useEffect(() => {
    if (isNavigating) {
      return;
    }

    const queued = queuedRef.current;

    if (queued) {
      queuedRef.current = undefined;

      if (pathname !== queued.href) {
        go(queued.href, queued.item);
        return;
      }
    }

    // Nothing running and nothing waiting: wherever the URL says we are is now
    // the truth, including when the user got here with the back button.
    setClickedItem(undefined);
  }, [isNavigating, pathname, go]);

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

      if (isNavigating) {
        queuedRef.current = { href, item };
        setClickedItem(item);
        return;
      }

      go(href, item);
    };

  return { activeItem: clickedItem ?? activeMenuItem, navigate };
};
