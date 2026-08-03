"use client";

// Hooks
import { useProjectFormats } from "../../../../lib/useProjectFormats";
import {
  Measure,
  useUnitPreference,
} from "../../../../lib/UnitPreferenceContext";

// Utils
import {
  getLengthUnitLabel,
  getOtherLengthUnit,
  getOtherTemperatureUnit,
  getOtherWeightUnit,
  getTemperatureUnitLabel,
  getWeightUnitLabel,
} from "../../../../utils/projectFormats";

// Styles
import styles from "../styles/UnitSwitch.module.css";

/**
 * The unit beside a measurement, as a pair you can pick from.
 *
 * It stands where the plain unit caption used to, so a field gains a choice
 * rather than a control: "cm" becomes "cm | in" with the one in use filled in.
 * Both are always shown, which is what makes it self-explanatory -- a single
 * label with a switch beside it leaves the reader guessing which way it goes.
 *
 * One per measure. Switching the height does not touch the weight, because the
 * reasons are unrelated: a metric scale and a Fahrenheit thermometer can be on
 * the same table.
 *
 * The project's own unit is always the left-hand option, so the pair does not
 * reorder itself when a project's setting changes.
 */
export const UnitSwitch = ({ measure }: { measure: Measure }) => {
  const { alternateUnits, setAlternateUnit } = useUnitPreference();
  const { projectLengthUnit, projectWeightUnit, projectTemperatureUnit } =
    useProjectFormats();

  const { projectLabel, otherLabel, name } = {
    length: {
      projectLabel: getLengthUnitLabel(projectLengthUnit),
      otherLabel: getLengthUnitLabel(getOtherLengthUnit(projectLengthUnit)),
      name: "height",
    },
    weight: {
      projectLabel: getWeightUnitLabel(projectWeightUnit),
      otherLabel: getWeightUnitLabel(getOtherWeightUnit(projectWeightUnit)),
      name: "weight",
    },
    temperature: {
      projectLabel: getTemperatureUnitLabel(projectTemperatureUnit),
      otherLabel: getTemperatureUnitLabel(
        getOtherTemperatureUnit(projectTemperatureUnit)
      ),
      name: "temperature",
    },
  }[measure];

  const isAlternate = alternateUnits[measure];

  const option = (label: string, alternate: boolean) => (
    <button
      type="button"
      className={styles.option}
      // The pair is one control with two states, so only the chosen option is a
      // pressed button -- a screen reader hears "cm, pressed" rather than two
      // unrelated buttons.
      aria-pressed={isAlternate === alternate}
      aria-label={`Show ${name} in ${label}`}
      onClick={() => setAlternateUnit(measure, alternate)}
    >
      {label}
    </button>
  );

  return (
    <span className={styles.unit_switch}>
      {option(projectLabel, false)}
      {option(otherLabel, true)}
    </span>
  );
};
