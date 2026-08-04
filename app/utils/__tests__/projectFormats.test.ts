import { describe, it, expect } from "vitest";

import {
  formatProjectDate,
  getDateFormatExample,
  getOtherLengthUnit,
  getOtherWeightUnit,
  getOtherTemperatureUnit,
  getLengthUnitLabel,
  getTemperatureUnitLabel,
  getWeightUnitLabel,
  toDisplayLength,
  toDisplayLengthBounds,
  toDisplayTemperature,
  toDisplayTemperatureBounds,
  toStoredLength,
  toStoredTemperature,
  toDisplayWeight,
  toDisplayWeightBounds,
  toStoredWeight,
} from "../projectFormats";

// Types
import {
  PROJECT_LENGTH_UNITS,
  PROJECT_WEIGHT_UNITS,
  PROJECT_TEMPERATURE_UNITS,
} from "../../types/ProjectTypes";

describe("length", () => {
  it("leaves centimetres alone", () => {
    expect(toDisplayLength({ centimetres: 178, unit: "cm" })).toBe(178);
    expect(toStoredLength({ value: 178, unit: "cm" })).toBe(178);
  });

  it("converts to and from inches", () => {
    expect(toDisplayLength({ centimetres: 177.8, unit: "in" })).toBe(70);
    expect(toStoredLength({ value: 70, unit: "in" })).toBe(177.8);
  });

  // The property that matters: a project switching units must not creep a
  // patient's height. Nothing here writes to the database, but a figure that
  // drifts on every view would eventually be saved by someone re-typing it.
  //
  // Two roundings, so the bound is the sum of both: showing inches to a tenth
  // can move a height by half a tenth (0.127cm), and storing centimetres to two
  // places adds another half of 0.01cm. 0.132cm all told -- a third of a
  // millimetre, well inside how precisely anyone measures a person. Anything
  // beyond it would mean the rounding, not the notation, had changed the figure.
  const MAX_DRIFT_CM = 0.05 * 2.54 + 0.005;

  it("round-trips every plausible height within a third of a millimetre", () => {
    for (let centimetres = 30; centimetres <= 220; centimetres += 0.5) {
      const shown = toDisplayLength({ centimetres, unit: "in" }) as number;
      const back = toStoredLength({ value: shown, unit: "in" }) as number;

      expect(Math.abs(back - centimetres)).toBeLessThanOrEqual(
        MAX_DRIFT_CM + 1e-9
      );
    }
  });

  // 2.54cm to the inch, so whole inches would collapse 177cm, 178cm and 179cm
  // onto the same 70in and lose a centimetre a clinician measured.
  it("keeps neighbouring centimetres distinguishable in inches", () => {
    const a = toDisplayLength({ centimetres: 177, unit: "in" });
    const b = toDisplayLength({ centimetres: 178, unit: "in" });

    expect(a).not.toBe(b);
  });

  it("treats nothing recorded as nothing to show", () => {
    for (const centimetres of [undefined, null, ""]) {
      expect(toDisplayLength({ centimetres, unit: "in" })).toBeUndefined();
    }
    expect(toDisplayLength({ centimetres: "nope", unit: "in" })).toBeUndefined();
    expect(toStoredLength({ value: undefined, unit: "in" })).toBeUndefined();
  });

  it("names the unit", () => {
    expect(getLengthUnitLabel("cm")).toBe("cm");
    expect(getLengthUnitLabel("in")).toBe("in");
  });
});

describe("weight", () => {
  it("leaves kilograms alone", () => {
    expect(toDisplayWeight({ kilograms: 64, unit: "kg" })).toBe(64);
    expect(toStoredWeight({ value: 64, unit: "kg" })).toBe(64);
  });

  it("converts to and from pounds", () => {
    // 1lb is exactly 0.45359237kg, so 64kg is 141.1lb.
    expect(toDisplayWeight({ kilograms: 64, unit: "lb" })).toBe(141.1);
    expect(toDisplayWeight({ kilograms: 0.45359237, unit: "lb" })).toBe(1);
    expect(toStoredWeight({ value: 141.1, unit: "lb" })).toBe(64);
  });

  // Two roundings again: a tenth of a pound is 0.0227kg, and storing kilograms
  // to two places adds half of 0.01kg. 0.028kg -- under thirty grams.
  const MAX_DRIFT_KG = 0.05 * 0.45359237 + 0.005;

  it("round-trips every plausible weight within thirty grams", () => {
    for (let kilograms = 0.5; kilograms <= 180; kilograms += 0.5) {
      const shown = toDisplayWeight({ kilograms, unit: "lb" }) as number;
      const back = toStoredWeight({ value: shown, unit: "lb" }) as number;

      expect(Math.abs(back - kilograms)).toBeLessThanOrEqual(MAX_DRIFT_KG + 1e-9);
    }
  });

  // A pound is a coarser division than a kilogram, so whole pounds would put a
  // 3.0kg and a 3.4kg newborn on the same number.
  it("keeps small weights distinguishable in pounds", () => {
    expect(toDisplayWeight({ kilograms: 3.0, unit: "lb" })).not.toBe(
      toDisplayWeight({ kilograms: 3.4, unit: "lb" })
    );
  });

  it("treats nothing recorded as nothing to show", () => {
    for (const kilograms of [undefined, null, ""]) {
      expect(toDisplayWeight({ kilograms, unit: "lb" })).toBeUndefined();
    }
    expect(toStoredWeight({ value: undefined, unit: "lb" })).toBeUndefined();
  });

  it("names the unit", () => {
    expect(getWeightUnitLabel("kg")).toBe("kg");
    expect(getWeightUnitLabel("lb")).toBe("lb");
  });
});

describe("temperature", () => {
  it("leaves Celsius alone", () => {
    expect(toDisplayTemperature({ celsius: 36.8, unit: "C" })).toBe(36.8);
    expect(toStoredTemperature({ value: 36.8, unit: "C" })).toBe(36.8);
  });

  it("converts to and from Fahrenheit", () => {
    expect(toDisplayTemperature({ celsius: 37, unit: "F" })).toBe(98.6);
    expect(toDisplayTemperature({ celsius: 0, unit: "F" })).toBe(32);
    expect(toStoredTemperature({ value: 98.6, unit: "F" })).toBe(37);
  });

  // 0 is a real reading, and `if (!celsius)` would have discarded it.
  it("does not mistake zero for nothing recorded", () => {
    expect(toDisplayTemperature({ celsius: 0, unit: "C" })).toBe(0);
    expect(toStoredTemperature({ value: 0, unit: "C" })).toBe(0);
  });

  it("round-trips every plausible body temperature", () => {
    for (let celsius = 34; celsius <= 44; celsius += 0.1) {
      const rounded = Math.round(celsius * 10) / 10;
      const shown = toDisplayTemperature({ celsius: rounded, unit: "F" }) as number;
      const back = toStoredTemperature({ value: shown, unit: "F" }) as number;

      expect(Math.abs(back - rounded)).toBeLessThanOrEqual(0.06);
    }
  });

  it("names the unit", () => {
    expect(getTemperatureUnitLabel("C")).toBe("°C");
    expect(getTemperatureUnitLabel("F")).toBe("°F");
  });
});

describe("field bounds", () => {
  it("passes centimetre bounds through unchanged", () => {
    expect(toDisplayLengthBounds({ min: 0, max: 220, unit: "cm" })).toEqual({
      min: 0,
      max: 220,
    });
  });

  // Rounded outward: 220cm is 86.6in, and a max of 86 would reject the tallest
  // height the rule is meant to permit.
  it("widens rather than narrows when converting", () => {
    expect(toDisplayLengthBounds({ min: 0, max: 220, unit: "in" })).toEqual({
      min: 0,
      max: 87,
    });
    expect(
      toDisplayTemperatureBounds({ min: 34, max: 44, unit: "F" })
    ).toEqual({ min: 93, max: 112 });
    // 180kg is 396.8lb, so the field must accept 397.
    expect(toDisplayWeightBounds({ min: 0, max: 180, unit: "lb" })).toEqual({
      min: 0,
      max: 397,
    });
  });

  // Whatever the field accepts, the stored value still has to satisfy the rule
  // in its own unit -- the bounds are a hint, not the check.
  it("stays inside the stored rule once converted back", () => {
    const { max } = toDisplayLengthBounds({ min: 0, max: 220, unit: "in" });
    const asCentimetres = toStoredLength({ value: max, unit: "in" }) as number;

    expect(asCentimetres).toBeGreaterThan(220);
  });
});

describe("dates", () => {
  it("writes the order the project asked for", () => {
    expect(
      formatProjectDate({ date: "2026-03-04", dateFormat: "mm/dd/yyyy" })
    ).toBe("03/04/2026");
    expect(
      formatProjectDate({ date: "2026-03-04", dateFormat: "dd/mm/yyyy" })
    ).toBe("04/03/2026");
  });

  it("pads single digits so a column lines up", () => {
    expect(
      formatProjectDate({ date: "2026-3-4", dateFormat: "mm/dd/yyyy" })
    ).toBe("03/04/2026");
  });

  // The bug the old formatter was written to avoid: a date built into a Date and
  // read back shifts a day for anyone west of Greenwich. This splits the string
  // instead, so the answer cannot depend on where it is read.
  it("shows the stored day from any timezone", () => {
    const original = process.env.TZ;

    for (const timeZone of [
      "Pacific/Kiritimati",
      "Pacific/Fiji",
      "UTC",
      "America/New_York",
      "Pacific/Midway",
    ]) {
      process.env.TZ = timeZone;
      expect(
        formatProjectDate({ date: "2006-02-25", dateFormat: "dd/mm/yyyy" })
      ).toBe("25/02/2006");
    }

    process.env.TZ = original;
  });

  it("handles missing and malformed input", () => {
    expect(formatProjectDate({ dateFormat: "mm/dd/yyyy" })).toBe("");
    expect(formatProjectDate({ date: "", dateFormat: "mm/dd/yyyy" })).toBe("");
    // Handed back rather than blanked: whatever it is, it is more informative
    // on screen than an empty cell.
    expect(formatProjectDate({ date: "nope", dateFormat: "mm/dd/yyyy" })).toBe(
      "nope"
    );
  });

  // This takes a calendar date, not a timestamp. A timestamp used to split into
  // a numeric year and month with the whole rest of the string as its day, and
  // came out reordered as "03T22:54:54.182Z/08/2026". Handing it back unchanged
  // is at least readable, and says plainly that the caller passed the wrong thing.
  it("does not reorder a timestamp into nonsense", () => {
    expect(
      formatProjectDate({
        date: "2026-08-03T22:54:54.182Z",
        dateFormat: "dd/mm/yyyy",
      })
    ).toBe("2026-08-03T22:54:54.182Z");
  });

  it("shows an example that distinguishes the two orders", () => {
    // The 4th of March: the one date that reads differently either way, which is
    // the whole point of the hint in the settings.
    expect(getDateFormatExample("mm/dd/yyyy")).toBe("03/04/2026");
    expect(getDateFormatExample("dd/mm/yyyy")).toBe("04/03/2026");
  });
});

describe("the other unit", () => {
  it("names the opposite of each unit", () => {
    expect(getOtherLengthUnit("cm")).toBe("in");
    expect(getOtherLengthUnit("in")).toBe("cm");
    expect(getOtherWeightUnit("kg")).toBe("lb");
    expect(getOtherWeightUnit("lb")).toBe("kg");
    expect(getOtherTemperatureUnit("C")).toBe("F");
    expect(getOtherTemperatureUnit("F")).toBe("C");
  });

  // What makes the viewer's switch a switch rather than a picker: asking twice
  // is asking for the unit the project already uses. A third unit would break
  // this, and the toggle would have to become a list.
  it("comes back to where it started when asked twice", () => {
    for (const unit of PROJECT_LENGTH_UNITS) {
      expect(getOtherLengthUnit(getOtherLengthUnit(unit))).toBe(unit);
    }
    for (const unit of PROJECT_WEIGHT_UNITS) {
      expect(getOtherWeightUnit(getOtherWeightUnit(unit))).toBe(unit);
    }
    for (const unit of PROJECT_TEMPERATURE_UNITS) {
      expect(getOtherTemperatureUnit(getOtherTemperatureUnit(unit))).toBe(unit);
    }
  });

  it("never names the unit it was given", () => {
    for (const unit of PROJECT_LENGTH_UNITS) {
      expect(getOtherLengthUnit(unit)).not.toBe(unit);
    }
    for (const unit of PROJECT_WEIGHT_UNITS) {
      expect(getOtherWeightUnit(unit)).not.toBe(unit);
    }
    for (const unit of PROJECT_TEMPERATURE_UNITS) {
      expect(getOtherTemperatureUnit(unit)).not.toBe(unit);
    }
  });

  it("only ever names a unit the app knows how to convert", () => {
    for (const unit of PROJECT_LENGTH_UNITS) {
      expect(PROJECT_LENGTH_UNITS).toContain(getOtherLengthUnit(unit));
    }
    for (const unit of PROJECT_WEIGHT_UNITS) {
      expect(PROJECT_WEIGHT_UNITS).toContain(getOtherWeightUnit(unit));
    }
    for (const unit of PROJECT_TEMPERATURE_UNITS) {
      expect(PROJECT_TEMPERATURE_UNITS).toContain(getOtherTemperatureUnit(unit));
    }
  });

  // The viewer's switch reads the record in the other notation. It must not be
  // able to alter what is stored: nothing here goes near a write, and reading a
  // height in inches and back has to give the centimetres it started as.
  it("shows a record in the other unit without changing it", () => {
    // Within the same rounding bounds the round-trip suites above establish: a
    // third of a millimetre, thirty grams, a twentieth of a degree. The switch
    // changes the notation and nothing else.
    const asInches = getOtherLengthUnit("cm");
    const backToCentimetres = toStoredLength({
      value: toDisplayLength({ centimetres: 178, unit: asInches }),
      unit: asInches,
    }) as number;

    expect(Math.abs(backToCentimetres - 178)).toBeLessThanOrEqual(0.05 * 2.54 + 0.005);

    const asPounds = getOtherWeightUnit("kg");
    const backToKilograms = toStoredWeight({
      value: toDisplayWeight({ kilograms: 64, unit: asPounds }),
      unit: asPounds,
    }) as number;

    expect(Math.abs(backToKilograms - 64)).toBeLessThanOrEqual(
      0.05 * 0.45359237 + 0.005
    );

    const asFahrenheit = getOtherTemperatureUnit("C");
    const backToCelsius = toStoredTemperature({
      value: toDisplayTemperature({ celsius: 36.8, unit: asFahrenheit }),
      unit: asFahrenheit,
    }) as number;

    expect(Math.abs(backToCelsius - 36.8)).toBeLessThanOrEqual(0.06);
  });
});

describe("values that are easy to lose", () => {
  // The database returns a numeric column as a string. `Number(...)` covers it,
  // but the guard has to run before the conversion or a height arrives as NaN.
  it("reads a measurement that arrived from the database as text", () => {
    expect(toDisplayLength({ centimetres: "178", unit: "cm" })).toBe(178);
    expect(toDisplayLength({ centimetres: "177.8", unit: "in" })).toBe(70);
    expect(toDisplayWeight({ kilograms: "64", unit: "kg" })).toBe(64);
    expect(toDisplayTemperature({ celsius: "36.8", unit: "C" })).toBe(36.8);
  });

  it("does not mistake a zero for a field nobody filled in", () => {
    // `if (!value)` would discard all of these. A zero weight is not plausible,
    // but discarding it silently is how an implausible record stops being
    // visible enough to correct.
    expect(toDisplayLength({ centimetres: 0, unit: "cm" })).toBe(0);
    expect(toDisplayLength({ centimetres: "0", unit: "in" })).toBe(0);
    expect(toDisplayWeight({ kilograms: 0, unit: "lb" })).toBe(0);
    expect(toStoredLength({ value: 0, unit: "in" })).toBe(0);
    expect(toStoredWeight({ value: 0, unit: "lb" })).toBe(0);
  });

  it("has nothing to show for text that is not a number", () => {
    expect(toDisplayWeight({ kilograms: "nope", unit: "lb" })).toBeUndefined();
    expect(toDisplayTemperature({ celsius: "nope", unit: "F" })).toBeUndefined();
    expect(toStoredLength({ value: NaN, unit: "in" })).toBeUndefined();
    expect(toStoredWeight({ value: NaN, unit: "lb" })).toBeUndefined();
    expect(toStoredTemperature({ value: NaN, unit: "F" })).toBeUndefined();
  });

  it("shows a negative temperature, which is a reading and not an error", () => {
    // Not a body temperature. It is a room, a fridge holding vaccines, or a
    // typo -- and all three are better seen than swallowed.
    expect(toDisplayTemperature({ celsius: -5, unit: "F" })).toBe(23);
    expect(toStoredTemperature({ value: 23, unit: "F" })).toBe(-5);
  });
});
