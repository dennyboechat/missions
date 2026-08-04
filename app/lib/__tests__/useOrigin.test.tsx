// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { useOrigin } from "../useOrigin";

/**
 * The QR code's problem: a link built from a guessed origin scans cleanly and
 * lands on the wrong deployment. Only the browser knows which host it asked, so
 * the hook is deliberately empty until there is one.
 */
const Link = () => {
  const origin = useOrigin();

  return <span data-testid="origin">{origin ?? "waiting"}</span>;
};

const shown = () => screen.getByTestId("origin").textContent;

afterEach(cleanup);

describe("useOrigin", () => {
  it("reports the host the page was actually asked for", () => {
    render(<Link />);

    expect(shown()).toBe(window.location.origin);
  });

  it("has no answer on the first render, and fills in once the browser can be asked", () => {
    // The first render is what the server produced and what the client hydrates
    // against, so the two have to agree: undefined in both. A value here would
    // be a guess, and the guess is what sent scanned codes to the wrong host.
    const seen: (string | undefined)[] = [];

    const Probe = () => {
      seen.push(useOrigin());

      return null;
    };

    render(<Probe />);

    expect(seen[0]).toBeUndefined();
    expect(seen[seen.length - 1]).toBe(window.location.origin);
  });

  it("keeps reporting the same origin across re-renders", () => {
    const { rerender } = render(<Link />);
    const first = shown();

    rerender(<Link />);

    expect(shown()).toBe(first);
  });

  it("reports an origin a link can be built on, with no trailing slash", () => {
    render(<Link />);

    const origin = shown() ?? "";

    expect(origin).toMatch(/^https?:\/\//);
    expect(origin.endsWith("/")).toBe(false);
    expect(`${origin}/patient-summary/abc`).toBe(
      `${window.location.origin}/patient-summary/abc`
    );
  });
});
