// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { useEffect } from "react";

import {
  UnitPreferenceProvider,
  useUnitPreference,
  MEASURES,
  Measure,
} from "../UnitPreferenceContext";

const STORAGE_KEY = "alternateUnitMeasures";

type SetAlternateUnit = ReturnType<typeof useUnitPreference>["setAlternateUnit"];

let setAlternateUnit: SetAlternateUnit | undefined;

/** Called from an effect, so the switch is reachable without a render writing. */
const holdSwitch = (set: SetAlternateUnit) => {
  setAlternateUnit = set;
};

/**
 * A component that reads the viewer's choice. The flags go into the DOM, so the
 * assertions read what was rendered rather than a context object that may have
 * been replaced since.
 */
const Reader = ({ onReady }: { onReady: (set: SetAlternateUnit) => void }) => {
  const { alternateUnits, setAlternateUnit: set } = useUnitPreference();

  useEffect(() => {
    onReady(set);
  }, [onReady, set]);

  return <span data-testid="units">{JSON.stringify(alternateUnits)}</span>;
};

/** What the viewer is currently reading each measure in. */
const alternateUnits = () =>
  JSON.parse(screen.getByTestId("units").textContent ?? "{}");

const mount = () =>
  render(
    <UnitPreferenceProvider>
      <Reader onReady={holdSwitch} />
    </UnitPreferenceProvider>
  );

const switchOn = (measure: Measure, showAlternate = true) =>
  act(() => {
    setAlternateUnit!(measure, showAlternate);
  });

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

beforeEach(() => {
  localStorage.clear();
});

afterEach(cleanup);

describe("UnitPreferenceProvider", () => {
  it("starts with every measure in the project's own unit", () => {
    mount();

    expect(alternateUnits()).toEqual({
      length: false,
      weight: false,
      temperature: false,
    });
  });

  it("adopts what this viewer chose last time", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ length: false, weight: true, temperature: true })
    );

    mount();

    expect(alternateUnits()).toEqual({
      length: false,
      weight: true,
      temperature: true,
    });
  });

  it("switches one measure without touching the others", () => {
    // A clinician may know Fahrenheit by feel and still be weighing patients on
    // a kilogram scale. Converting all three together forced them to translate
    // two measures in their head to stop translating the third.
    mount();

    switchOn("temperature");

    expect(alternateUnits()).toEqual({
      length: false,
      weight: false,
      temperature: true,
    });
  });

  it("switches a measure back off again", () => {
    mount();

    switchOn("weight");
    expect(alternateUnits().weight).toBe(true);

    switchOn("weight", false);
    expect(alternateUnits().weight).toBe(false);
  });

  it("remembers the choice, so it survives a navigation", () => {
    mount();

    switchOn("length");

    expect(stored()).toEqual({ length: true, weight: false, temperature: false });
  });

  it("remembers every measure together, not only the one just switched", () => {
    mount();

    switchOn("length");
    switchOn("temperature");

    expect(stored()).toEqual({ length: true, weight: false, temperature: true });

    cleanup();
    mount();

    expect(alternateUnits()).toEqual({
      length: true,
      weight: false,
      temperature: true,
    });
  });

  it("reads nothing into a stored value that is not exactly true", () => {
    // This is a value the user can edit in their own browser. Anything
    // unrecognised means "not switched" rather than throwing the page.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ length: "true", weight: 1, temperature: null })
    );

    mount();

    expect(alternateUnits()).toEqual({
      length: false,
      weight: false,
      temperature: false,
    });
  });

  it("survives a stored value that is not JSON at all", () => {
    localStorage.setItem(STORAGE_KEY, "not json {");

    mount();

    expect(alternateUnits()).toEqual({
      length: false,
      weight: false,
      temperature: false,
    });
  });

  it("survives a stored value that is JSON but not an object", () => {
    localStorage.setItem(STORAGE_KEY, "true");

    mount();

    expect(alternateUnits().length).toBe(false);
  });

  it("clears the single all-measures flag this replaced", () => {
    // Left behind, it would sit in existing browsers forever meaning nothing.
    localStorage.setItem("showAlternateUnits", "true");

    mount();

    expect(localStorage.getItem("showAlternateUnits")).toBe(null);
  });

  it("does not read the old flag as a preference", () => {
    localStorage.setItem("showAlternateUnits", "true");

    mount();

    expect(alternateUnits()).toEqual({
      length: false,
      weight: false,
      temperature: false,
    });
  });

  it("holds an answer for every measure the app offers", () => {
    mount();

    for (const measure of MEASURES) {
      expect(alternateUnits()[measure]).toBe(false);
    }

    expect(Object.keys(alternateUnits()).sort()).toEqual([...MEASURES].sort());
  });
});

describe("useUnitPreference outside a provider", () => {
  it("reads every measure in the project's unit and ignores a switch", () => {
    // A component rendered outside the provider shows the record as the project
    // writes it down, which is never wrong -- only unconverted.
    render(<Reader onReady={holdSwitch} />);

    expect(alternateUnits()).toEqual({
      length: false,
      weight: false,
      temperature: false,
    });
    expect(() => setAlternateUnit!("weight", true)).not.toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(null);
  });
});
