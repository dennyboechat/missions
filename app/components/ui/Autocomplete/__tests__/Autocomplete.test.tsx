// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";

import { Autocomplete } from "../components/Autocomplete";

const items = [
  { id: "nz", name: "New Zealand" },
  { id: "fj", name: "Fiji" },
  { id: "mg", name: "Madagascar" },
];

const renderAutocomplete = (props = {}) =>
  render(
    <Theme>
      <Autocomplete items={items} {...props} />
    </Theme>
  );

const input = () => screen.getByRole("combobox");
const list = () => screen.queryByRole("listbox");

afterEach(cleanup);

describe("opening and closing", () => {
  it("opens on focus and lists the items", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    expect(list()).not.toBeNull();
    expect(screen.getByText("New Zealand")).toBeDefined();
  });

  it("closes when the field is left for somewhere else", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    // A press elsewhere on the page, then the blur it causes.
    fireEvent.mouseDown(document.body);
    fireEvent.blur(input());

    expect(list()).toBeNull();
  });

  it("closes on a press outside the field", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    fireEvent.mouseDown(document.body);

    expect(list()).toBeNull();
  });
});

describe("pressing the list's own scrollbar", () => {
  // The bug: the scrollbar gutter is not an option, so nothing cancels its
  // mousedown, the browser moves focus off the input, and the blur handler shut
  // the list -- which made the list impossible to scroll by its scrollbar.
  it("keeps the list open", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    // Exactly what a gutter press is: a mousedown on the list element itself
    // rather than on one of its options, followed by the input losing focus.
    fireEvent.mouseDown(list() as HTMLElement);
    fireEvent.blur(input());

    expect(list()).not.toBeNull();
  });

  it("does not commit the field on the way past", () => {
    const onBlur = vi.fn();
    renderAutocomplete({ onBlur });
    fireEvent.focus(input());

    fireEvent.mouseDown(list() as HTMLElement);
    fireEvent.blur(input());

    // A scroll is not a decision, so the parent's commit must not run.
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("still closes once the press really is outside", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    fireEvent.mouseDown(list() as HTMLElement);
    fireEvent.blur(input());
    expect(list()).not.toBeNull();

    // Scroll finished, then a genuine click away.
    fireEvent.mouseUp(document);
    fireEvent.mouseDown(document.body);
    fireEvent.blur(input());

    expect(list()).toBeNull();
  });
});

describe("pressing a page scrollbar", () => {
  // jsdom computes offsetX/offsetY and always reports 0, and MouseEvent's init
  // dictionary has no way to set them, so the press has to be built by hand.
  const pressAt = (target: HTMLElement, offsetX: number, offsetY: number) => {
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "offsetX", { value: offsetX });
    Object.defineProperty(event, "offsetY", { value: offsetY });
    // Through fireEvent rather than dispatchEvent: it wraps the dispatch in act,
    // so React has re-rendered by the time the assertion runs.
    fireEvent(target, event);
  };

  const withClientBox = (element: HTMLElement, width: number, height: number) => {
    Object.defineProperty(element, "clientWidth", {
      value: width,
      configurable: true,
    });
    Object.defineProperty(element, "clientHeight", {
      value: height,
      configurable: true,
    });
  };

  // A scrollbar lives inside the border box but outside the client box, so an
  // offset past clientWidth is the gutter. Reaching for the page's scrollbar is
  // not clicking away from the field.
  it("is not treated as clicking away", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    withClientBox(document.documentElement, 100, 100);
    pressAt(document.documentElement, 108, 40);

    expect(list()).not.toBeNull();
  });

  it("still closes for a press on ordinary content", () => {
    renderAutocomplete();
    fireEvent.focus(input());

    withClientBox(document.body, 500, 500);
    pressAt(document.body, 20, 20);

    expect(list()).toBeNull();
  });
});

describe("choosing an option", () => {
  // Unchanged by the fix, and worth guarding: options cancel their own
  // mousedown, so this path never depended on the blur handler.
  it("selects on mousedown and closes", () => {
    const onSelect = vi.fn();
    renderAutocomplete({ onSelect });
    fireEvent.focus(input());

    fireEvent.mouseDown(screen.getByText("Fiji"));

    expect(onSelect).toHaveBeenCalledWith({ id: "fj", name: "Fiji" });
    expect(list()).toBeNull();
  });

  it("filters as the query is typed", () => {
    renderAutocomplete();
    fireEvent.focus(input());
    fireEvent.change(input(), { target: { value: "mad" } });

    expect(screen.getByText("Madagascar")).toBeDefined();
    expect(screen.queryByText("Fiji")).toBeNull();
  });
});
