// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const project = vi.fn();
const alternateUnits = vi.fn();

const NONE = { length: false, weight: false, temperature: false };
const ALL = { length: true, weight: true, temperature: true };

vi.mock("../ProjectContext", () => ({
  useProject: () => ({ project: project(), setProject: vi.fn() }),
}));
vi.mock("../UnitPreferenceContext", () => ({
  useUnitPreference: () => ({
    alternateUnits: alternateUnits(),
    setAlternateUnit: vi.fn(),
  }),
}));

const { useProjectFormats } = await import("../useProjectFormats");

const metricProject = {
  projectLengthUnit: "cm",
  projectWeightUnit: "kg",
  projectTemperatureUnit: "C",
  projectDateFormat: "dd/mm/yyyy",
};

const imperialProject = {
  projectLengthUnit: "in",
  projectWeightUnit: "lb",
  projectTemperatureUnit: "F",
  projectDateFormat: "mm/dd/yyyy",
};

const formats = () => renderHook(() => useProjectFormats()).result.current;

beforeEach(() => {
  project.mockReset();
  alternateUnits.mockReset();
  alternateUnits.mockReturnValue(NONE);
});

describe("the project's own units", () => {
  it("uses them when the viewer has not asked for anything else", () => {
    project.mockReturnValue(imperialProject);

    const f = formats();

    expect(f.lengthUnitLabel).toBe("in");
    expect(f.weightUnitLabel).toBe("lb");
    expect(f.temperatureUnitLabel).toBe("°F");
    expect(f.displayLength(177.8)).toBe(70);
    expect(f.displayWeight(64)).toBe(141.1);
    expect(f.displayTemperature(37)).toBe(98.6);
  });

  it("falls back to the shipped defaults before a project has loaded", () => {
    project.mockReturnValue(undefined);

    const f = formats();

    expect(f.lengthUnitLabel).toBe("cm");
    expect(f.weightUnitLabel).toBe("kg");
    expect(f.temperatureUnitLabel).toBe("°C");
  });
});

describe("the viewer's per-measure switches", () => {
  it("shows an imperial project in metric", () => {
    project.mockReturnValue(imperialProject);
    alternateUnits.mockReturnValue(ALL);

    const f = formats();

    expect(f.lengthUnitLabel).toBe("cm");
    expect(f.weightUnitLabel).toBe("kg");
    expect(f.temperatureUnitLabel).toBe("°C");
    expect(f.displayLength(177.8)).toBe(177.8);
    expect(f.displayWeight(64)).toBe(64);
    expect(f.displayTemperature(37)).toBe(37);
  });

  it("shows a metric project in imperial", () => {
    project.mockReturnValue(metricProject);
    alternateUnits.mockReturnValue(ALL);

    const f = formats();

    expect(f.lengthUnitLabel).toBe("in");
    expect(f.weightUnitLabel).toBe("lb");
    expect(f.temperatureUnitLabel).toBe("°F");
    expect(f.displayLength(177.8)).toBe(70);
  });

  // The property the whole design rests on: reading, writing and the bounds a
  // field accepts are all built from the same effective unit. If one of them
  // were left on the project's unit, a viewer in kg on a lb project would type
  // 70 and store 31.8kg.
  it("moves display, entry and bounds together", () => {
    project.mockReturnValue(imperialProject);
    alternateUnits.mockReturnValue(ALL);

    const f = formats();

    // Reading kilograms...
    expect(f.weightUnitLabel).toBe("kg");
    expect(f.displayWeight(64)).toBe(64);
    // ...so a typed 64 is 64kg, not 64lb.
    expect(f.storedWeight(64)).toBe(64);
    // ...and the field accepts the kilogram range, not the pound one.
    expect(f.weightBounds(0, 180)).toEqual({ min: 0, max: 180 });
  });

  // The point of splitting them: one measure switching must leave the others
  // where they were. A single flag made a nurse on a kilogram scale read
  // Fahrenheit in Celsius as the price of using it.
  it("switches one measure without disturbing the others", () => {
    project.mockReturnValue(imperialProject);
    alternateUnits.mockReturnValue({ ...NONE, weight: true });

    const f = formats();

    expect(f.weightUnitLabel).toBe("kg");
    expect(f.lengthUnitLabel).toBe("in");
    expect(f.temperatureUnitLabel).toBe("°F");
  });

  it("switches temperature on its own too", () => {
    project.mockReturnValue(metricProject);
    alternateUnits.mockReturnValue({ ...NONE, temperature: true });

    const f = formats();

    expect(f.temperatureUnitLabel).toBe("°F");
    expect(f.displayTemperature(37)).toBe(98.6);
    expect(f.lengthUnitLabel).toBe("cm");
    expect(f.weightUnitLabel).toBe("kg");
  });

  it("reports each measure's state back", () => {
    project.mockReturnValue(metricProject);
    alternateUnits.mockReturnValue({ ...NONE, length: true });

    expect(formats().alternateUnits).toEqual({
      length: true,
      weight: false,
      temperature: false,
    });
  });

  // The project's own units stay available whatever the viewer is reading, so
  // the toggle can name what it would switch to.
  it("keeps reporting the project's units unchanged", () => {
    project.mockReturnValue(imperialProject);
    alternateUnits.mockReturnValue(ALL);

    const f = formats();

    expect(f.projectLengthUnit).toBe("in");
    expect(f.projectWeightUnit).toBe("lb");
    expect(f.projectTemperatureUnit).toBe("F");
  });

  // A date order has no other unit to convert into, and flipping it would turn
  // an ambiguous date into a differently ambiguous one.
  it("leaves the date order alone", () => {
    project.mockReturnValue(metricProject);
    expect(formats().formatDate("2026-03-04")).toBe("04/03/2026");

    alternateUnits.mockReturnValue(ALL);
    expect(formats().formatDate("2026-03-04")).toBe("04/03/2026");
  });
});
