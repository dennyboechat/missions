// Turning what is stored into what a mission reads, and back.
//
// One basis in the database -- centimetres, Celsius, ISO dates -- and a
// conversion at each edge. Nothing here is ever used to rewrite a stored value:
// a project that switches to inches shows inches, and the row it came from is
// untouched, so switching back shows exactly the figure that was recorded.

// Types
import {
  ProjectDateFormat,
  ProjectLengthUnit,
  ProjectTemperatureUnit,
  ProjectWeightUnit,
} from "../types/ProjectTypes";

const CM_PER_INCH = 2.54;
// The international avoirdupois pound, exactly.
const KG_PER_POUND = 0.45359237;

/**
 * The other unit of each measure.
 *
 * Two options apiece, so "the other one" is well defined and a viewer's toggle
 * needs no third state. If a third unit is ever added these stop being total and
 * the toggle becomes a picker.
 */
export const getOtherLengthUnit = (unit: ProjectLengthUnit): ProjectLengthUnit =>
  unit === "cm" ? "in" : "cm";

export const getOtherWeightUnit = (unit: ProjectWeightUnit): ProjectWeightUnit =>
  unit === "kg" ? "lb" : "kg";

export const getOtherTemperatureUnit = (
  unit: ProjectTemperatureUnit
): ProjectTemperatureUnit => (unit === "C" ? "F" : "C");

/** What the unit is called next to a number. */
export const getLengthUnitLabel = (unit: ProjectLengthUnit) =>
  unit === "in" ? "in" : "cm";

export const getWeightUnitLabel = (unit: ProjectWeightUnit) =>
  unit === "lb" ? "lb" : "kg";

export const getTemperatureUnitLabel = (unit: ProjectTemperatureUnit) =>
  unit === "F" ? "°F" : "°C";

/**
 * How precisely each unit is worth writing.
 *
 * An inch is 2.54cm, so a whole centimetre is finer than a whole inch -- one
 * decimal keeps a height in inches as exact as the centimetre it came from
 * rather than rounding 178cm and 179cm onto the same 70in. Fahrenheit degrees
 * are smaller than Celsius ones, so a tenth is likewise enough to preserve the
 * 0.1C a clinician recorded.
 */
const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

/** Stored centimetres as the project's unit, for showing and for editing. */
export const toDisplayLength = ({
  centimetres,
  unit,
}: {
  centimetres?: number | string | null;
  unit: ProjectLengthUnit;
}): number | undefined => {
  if (centimetres === undefined || centimetres === null || centimetres === "") {
    return undefined;
  }

  const value = Number(centimetres);

  if (Number.isNaN(value)) {
    return undefined;
  }

  return unit === "in" ? round(value / CM_PER_INCH, 1) : round(value, 2);
};

/** A number typed in the project's unit, as the centimetres that get stored. */
export const toStoredLength = ({
  value,
  unit,
}: {
  value?: number;
  unit: ProjectLengthUnit;
}): number | undefined => {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  return unit === "in" ? round(value * CM_PER_INCH, 2) : round(value, 2);
};

/**
 * Stored kilograms as the project's unit.
 *
 * One decimal in pounds, matching the two in kilograms closely enough that a
 * round trip stays inside a tenth of a pound: a pound is a coarser division than
 * a kilogram, so whole pounds would lose a real 0.5kg difference between two
 * infants.
 */
export const toDisplayWeight = ({
  kilograms,
  unit,
}: {
  kilograms?: number | string | null;
  unit: ProjectWeightUnit;
}): number | undefined => {
  if (kilograms === undefined || kilograms === null || kilograms === "") {
    return undefined;
  }

  const value = Number(kilograms);

  if (Number.isNaN(value)) {
    return undefined;
  }

  return unit === "lb" ? round(value / KG_PER_POUND, 1) : round(value, 2);
};

/** A number typed in the project's unit, as the kilograms that get stored. */
export const toStoredWeight = ({
  value,
  unit,
}: {
  value?: number;
  unit: ProjectWeightUnit;
}): number | undefined => {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  return unit === "lb" ? round(value * KG_PER_POUND, 2) : round(value, 2);
};

export const toDisplayTemperature = ({
  celsius,
  unit,
}: {
  celsius?: number | string | null;
  unit: ProjectTemperatureUnit;
}): number | undefined => {
  if (celsius === undefined || celsius === null || celsius === "") {
    return undefined;
  }

  const value = Number(celsius);

  if (Number.isNaN(value)) {
    return undefined;
  }

  return unit === "F" ? round(value * (9 / 5) + 32, 1) : round(value, 1);
};

export const toStoredTemperature = ({
  value,
  unit,
}: {
  value?: number;
  unit: ProjectTemperatureUnit;
}): number | undefined => {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  return unit === "F" ? round((value - 32) * (5 / 9), 2) : round(value, 2);
};

/**
 * The bounds a field accepts, moved into the unit the field is showing.
 *
 * The rule being enforced is about the patient, not about the notation: a
 * plausible height is a plausible height whether it reads 220cm or 86.6in. The
 * bounds are declared once in centimetres and Celsius and converted here, so a
 * project in inches cannot end up with a different idea of what is plausible.
 */
export const toDisplayLengthBounds = ({
  min,
  max,
  unit,
}: {
  min: number;
  max: number;
  unit: ProjectLengthUnit;
}) => ({
  // Outward in both directions: rounding a maximum down would reject the very
  // figure the bound is meant to allow.
  min: Math.floor(toDisplayLength({ centimetres: min, unit }) ?? min),
  max: Math.ceil(toDisplayLength({ centimetres: max, unit }) ?? max),
});

export const toDisplayWeightBounds = ({
  min,
  max,
  unit,
}: {
  min: number;
  max: number;
  unit: ProjectWeightUnit;
}) => ({
  min: Math.floor(toDisplayWeight({ kilograms: min, unit }) ?? min),
  max: Math.ceil(toDisplayWeight({ kilograms: max, unit }) ?? max),
});

export const toDisplayTemperatureBounds = ({
  min,
  max,
  unit,
}: {
  min: number;
  max: number;
  unit: ProjectTemperatureUnit;
}) => ({
  min: Math.floor(toDisplayTemperature({ celsius: min, unit }) ?? min),
  max: Math.ceil(toDisplayTemperature({ celsius: max, unit }) ?? max),
});

/**
 * A YYYY-MM-DD date in the order the project writes dates in.
 *
 * Parsed by splitting the string rather than through Date: constructing a Date
 * from it and reading it back re-interprets the day in the viewer's timezone,
 * which showed every stored date one day early from anywhere west of Greenwich.
 * A date of birth has no time and no zone, and this keeps it that way.
 */
export const formatProjectDate = ({
  date,
  dateFormat,
}: {
  date?: string;
  dateFormat: ProjectDateFormat;
}): string => {
  if (!date) {
    return "";
  }

  const [year, month, day] = date.split("-");

  // Unparseable input is handed back untouched: whatever it is, it is more
  // informative on screen than an empty cell.
  if (!year || !month || !day || Number.isNaN(Number(year))) {
    return date;
  }

  const paddedMonth = month.padStart(2, "0");
  const paddedDay = day.padStart(2, "0");

  return dateFormat === "dd/mm/yyyy"
    ? `${paddedDay}/${paddedMonth}/${year}`
    : `${paddedMonth}/${paddedDay}/${year}`;
};

/** What the chosen order looks like, for a hint under the setting. */
export const getDateFormatExample = (dateFormat: ProjectDateFormat) =>
  formatProjectDate({ date: "2026-03-04", dateFormat });
