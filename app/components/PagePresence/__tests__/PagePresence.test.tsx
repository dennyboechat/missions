// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";

import { PagePresence } from "../components/PagePresence";
import { PageViewer } from "../../../types/PagePresence";

const viewer = (userName: string, resourceLabel: string): PageViewer => ({
  userId: `id-${userName}`,
  userName,
  resourceLabel,
});

const renderPresence = (viewers: PageViewer[]) =>
  render(
    <Theme>
      <PagePresence viewers={viewers} />
    </Theme>,
  );

afterEach(cleanup);

describe("PagePresence", () => {
  it("shows nothing when you are the only one here", () => {
    renderPresence([]);

    // Which is almost always. A permanent "nobody else is here" would be a line
    // of chrome that is only ever noise.
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("also here")).toBeNull();
  });

  it("shows a disc per colleague, with their initials", () => {
    renderPresence([viewer("Maria Silva", "Dental"), viewer("Joe Lin", "General")]);

    expect(screen.getByText("MS")).toBeTruthy();
    expect(screen.getByText("JL")).toBeTruthy();
  });

  it("collapses a crowd into a count", () => {
    renderPresence([
      viewer("Ana Reis", "General"),
      viewer("Bo Chen", "Dental"),
      viewer("Cara Dias", "Summary"),
      viewer("Dev Rao", "Personal"),
      viewer("Eve Muir", "General"),
    ]);

    expect(screen.getByText("+2")).toBeTruthy();
    // The first three still read as themselves.
    expect(screen.getByText("AR")).toBeTruthy();
    expect(screen.queryByText("DR")).toBeNull();
  });

  it("says who is where in full, for anyone not using a pointer", () => {
    renderPresence([viewer("Maria Silva", "Dental"), viewer("Joe Lin", "General")]);

    // The discs are aria-hidden decoration; this is the accessible version, and
    // it carries the tab each person is on because that is the part that says
    // whether they are about to edit the same field.
    expect(
      screen.getByRole("status").textContent,
    ).toBe("Maria Silva — Dental and Joe Lin — General also have this record open.");
  });

  it("reads as a sentence for a single colleague", () => {
    renderPresence([viewer("Maria Silva", "Dental")]);

    expect(screen.getByRole("status").textContent).toBe(
      "Maria Silva — Dental also has this record open.",
    );
  });

  it("gives the same person the same colour every time", () => {
    const { container: first } = renderPresence([viewer("Maria Silva", "Dental")]);
    const firstColor = first.querySelector("span")?.getAttribute("style");

    cleanup();

    const { container: second } = renderPresence([
      viewer("Joe Lin", "General"),
      viewer("Maria Silva", "Summary"),
    ]);
    const mariaColor = Array.from(second.querySelectorAll("span"))
      .find((element) => element.textContent === "MS")
      ?.getAttribute("style");

    // Recognising a colleague before reading the name only works if the colour
    // does not move about between screens.
    expect(mariaColor).toBe(firstColor);
  });
});
