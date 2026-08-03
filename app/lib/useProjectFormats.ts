"use client";

// Hooks
import { useMemo } from "react";
import { useProject } from "./ProjectContext";
import { useUnitPreference } from "./UnitPreferenceContext";

// Utils
import {
  formatProjectDate,
  getLengthUnitLabel,
  getTemperatureUnitLabel,
  toDisplayLength,
  toDisplayLengthBounds,
  toDisplayWeight,
  toDisplayWeightBounds,
  getWeightUnitLabel,
  toStoredWeight,
  getOtherLengthUnit,
  getOtherWeightUnit,
  getOtherTemperatureUnit,
  toDisplayTemperature,
  toDisplayTemperatureBounds,
  toStoredLength,
  toStoredTemperature,
} from "../utils/projectFormats";

// Types
import { DEFAULT_PROJECT_FORMATS } from "../types/ProjectTypes";

/**
 * The current project's units and date order, already bound to it.
 *
 * Every screen that shows a height, a temperature or a date needs the same three
 * settings, and reaching for the project each time invited each one to reach a
 * slightly different conclusion about the default. This is the single place that
 * decides, and it falls back to the shipped defaults for the frames before the
 * project has loaded -- a blank field is better than a figure captioned with the
 * wrong unit.
 */
export const useProjectFormats = () => {
  const { project } = useProject();
  const { alternateUnits } = useUnitPreference();

  // What the mission writes down.
  const projectLengthUnit =
    project?.projectLengthUnit ?? DEFAULT_PROJECT_FORMATS.lengthUnit;
  const projectWeightUnit =
    project?.projectWeightUnit ?? DEFAULT_PROJECT_FORMATS.weightUnit;
  const projectTemperatureUnit =
    project?.projectTemperatureUnit ?? DEFAULT_PROJECT_FORMATS.temperatureUnit;

  // What this viewer is reading, which is the same thing unless they have asked
  // for the other unit. Everything below is built from these, so a screen that
  // shows a measurement, a field that parses one and the bounds that field
  // accepts all move together -- there is no way for one of them to be left
  // speaking the project's unit while the others switch.
  const lengthUnit = alternateUnits.length
    ? getOtherLengthUnit(projectLengthUnit)
    : projectLengthUnit;
  const weightUnit = alternateUnits.weight
    ? getOtherWeightUnit(projectWeightUnit)
    : projectWeightUnit;
  const temperatureUnit = alternateUnits.temperature
    ? getOtherTemperatureUnit(projectTemperatureUnit)
    : projectTemperatureUnit;

  // Not flipped. A date order is a notation, not a measure, and 03/04 against
  // 04/03 has no "other unit" a reader could convert between -- offering it
  // would only make an ambiguous date ambiguous in a second way.
  const dateFormat = project?.projectDateFormat ?? DEFAULT_PROJECT_FORMATS.dateFormat;

  return useMemo(
    () => ({
      lengthUnit,
      weightUnit,
      temperatureUnit,
      dateFormat,

      /** Per measure, whether this is the project's own unit or the other one. */
      alternateUnits,
      projectLengthUnit,
      projectWeightUnit,
      projectTemperatureUnit,

      lengthUnitLabel: getLengthUnitLabel(lengthUnit),
      weightUnitLabel: getWeightUnitLabel(weightUnit),
      temperatureUnitLabel: getTemperatureUnitLabel(temperatureUnit),

      /** Stored centimetres as the project's unit. */
      displayLength: (centimetres?: number | string | null) =>
        toDisplayLength({ centimetres, unit: lengthUnit }),
      /** A number typed in the project's unit, as centimetres to store. */
      storedLength: (value?: number) => toStoredLength({ value, unit: lengthUnit }),
      lengthBounds: (min: number, max: number) =>
        toDisplayLengthBounds({ min, max, unit: lengthUnit }),

      /** Stored kilograms as the project's unit. */
      displayWeight: (kilograms?: number | string | null) =>
        toDisplayWeight({ kilograms, unit: weightUnit }),
      /** A number typed in the project's unit, as kilograms to store. */
      storedWeight: (value?: number) => toStoredWeight({ value, unit: weightUnit }),
      weightBounds: (min: number, max: number) =>
        toDisplayWeightBounds({ min, max, unit: weightUnit }),

      displayTemperature: (celsius?: number | string | null) =>
        toDisplayTemperature({ celsius, unit: temperatureUnit }),
      storedTemperature: (value?: number) =>
        toStoredTemperature({ value, unit: temperatureUnit }),
      temperatureBounds: (min: number, max: number) =>
        toDisplayTemperatureBounds({ min, max, unit: temperatureUnit }),

      /** A YYYY-MM-DD date in the project's order. */
      formatDate: (date?: string) => formatProjectDate({ date, dateFormat }),
    }),
    [
      lengthUnit,
      weightUnit,
      temperatureUnit,
      dateFormat,
      alternateUnits,
      projectLengthUnit,
      projectWeightUnit,
      projectTemperatureUnit,
    ]
  );
};
