// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act, screen } from "@testing-library/react";

import { useMenuNavigation } from "../useMenuNavigation";

const push = vi.fn();
let pathname = "/patient-summary/1";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

const ITEMS = ["summary", "general", "dentistry", "personal"] as const;

type Item = (typeof ITEMS)[number];

const hrefFor = (item: Item) => `/patient-${item}/1`;

const Menu = ({ activeMenuItem }: { activeMenuItem: Item }) => {
  const { activeItem, navigate } = useMenuNavigation<Item>(activeMenuItem);

  return (
    <ul>
      <li data-testid="active">{activeItem}</li>
      {ITEMS.map((item) => (
        <li key={item}>
          <a
            href={hrefFor(item)}
            data-testid={item}
            onClick={navigate(hrefFor(item), item)}
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  );
};

// The component under test takes a click handler, not a user-event session, and
// these clicks have to be spaced on a fake clock -- so they are dispatched
// directly rather than through userEvent, which advances real time.
// Cancelable, so the hook's preventDefault means something: without it jsdom
// follows the href and warns about navigating to another document.
const click = async (item: Item, modifiers: MouseEventInit = {}) => {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...modifiers,
  });

  await act(async () => {
    screen.getByTestId(item).dispatchEvent(event);
  });

  return event;
};

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  push.mockClear();
  pathname = "/patient-summary/1";
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useMenuNavigation", () => {
  it("navigates on a single click without waiting", async () => {
    render(<Menu activeMenuItem="summary" />);

    await click("general");

    // No settling, no debounce felt: a menu that hesitates on one click reads as
    // a click that did not register.
    expect(push).toHaveBeenCalledExactlyOnceWith(hrefFor("general"));
  });

  it("mounts two pages for a burst of four, not four", async () => {
    render(<Menu activeMenuItem="summary" />);

    await click("general");
    await advance(80);
    await click("dentistry");
    await advance(80);
    await click("personal");
    await advance(200);

    // The first click goes, the rest collapse into the last one. Dentistry is
    // never navigated to, so its reads never take a place in the server-action
    // queue ahead of personal's.
    expect(push.mock.calls.map(([href]) => href)).toEqual([
      hrefFor("general"),
      hrefFor("personal"),
    ]);
  });

  it("highlights the last clicked item straight away", async () => {
    render(<Menu activeMenuItem="summary" />);

    await click("general");
    await advance(50);
    await click("personal");

    // Still 100ms before personal is navigated to, and the URL is on summary.
    // The menu has to be pointing at personal regardless.
    expect(screen.getByTestId("active").textContent).toBe("personal");
  });

  it("does not navigate when a burst ends where it started", async () => {
    render(<Menu activeMenuItem="summary" />);

    await click("general");
    await advance(50);
    // Down the menu and back up again. The commit for the first click lands
    // before the burst closes.
    pathname = hrefFor("general");
    await click("general");
    await advance(200);

    expect(push).toHaveBeenCalledExactlyOnceWith(hrefFor("general"));
  });

  it("collapses a second burst the same way", async () => {
    render(<Menu activeMenuItem="summary" />);

    await click("general");
    await advance(80);
    await click("personal");
    await advance(200);
    // The router is a mock here, so the URL has to be moved by hand to where the
    // first burst left it.
    pathname = hrefFor("personal");
    push.mockClear();

    // A burst can have a second wind once the first target is on its way.
    await click("dentistry");
    await advance(80);
    await click("summary");
    await advance(200);

    expect(push.mock.calls.map(([href]) => href)).toEqual([hrefFor("summary")]);
  });

  it("leaves a modified click to the browser", async () => {
    render(<Menu activeMenuItem="summary" />);

    const event = await click("general", { metaKey: true });

    // Cmd-click opens the section in a new tab; the router must not also move
    // this one, and the default must be left alone for the browser to act on.
    expect(push).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
