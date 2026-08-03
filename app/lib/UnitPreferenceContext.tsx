"use client";

// Multivariate Dependencies
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** The measures a viewer can read in the other unit, each on its own. */
export type Measure = "length" | "weight" | "temperature";

export const MEASURES: Measure[] = ["length", "weight", "temperature"];

const STORAGE_KEY = "alternateUnitMeasures";

type MeasureFlags = Record<Measure, boolean>;

const NONE: MeasureFlags = {
  length: false,
  weight: false,
  temperature: false,
};

interface UnitPreferenceContextType {
  /** Per measure: whether this viewer is reading the other unit of it. */
  alternateUnits: MeasureFlags;
  setAlternateUnit: (measure: Measure, showAlternate: boolean) => void;
}

const UnitPreferenceContext = createContext<UnitPreferenceContextType>({
  alternateUnits: NONE,
  setAlternateUnit: () => {},
});

const read = (): MeasureFlags => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

    // Read key by key rather than trusting the parsed object: this is a value a
    // user can edit, and an older build stored a single boolean under a
    // different key. Anything unrecognised simply means "not switched".
    return {
      length: stored?.length === true,
      weight: stored?.weight === true,
      temperature: stored?.temperature === true,
    };
  } catch {
    return NONE;
  }
};

/**
 * One viewer's choice to read a measure in the other unit, held per measure.
 *
 * Three independent switches rather than one, because the reasons are
 * independent: a clinician may know Fahrenheit by feel and still be weighing
 * patients on a kilogram scale. Converting all three together forced them to
 * translate two measures in their head to stop translating the third.
 *
 * Deliberately not a project setting. The project's units are what the mission
 * writes down and what all of its people see by default; this is one person
 * converting on screen. Nothing here reaches the database, so a switched view
 * cannot alter a record -- see utils/projectFormats.ts, where the same
 * conversions serve reading and writing alike.
 *
 * Kept in localStorage: it belongs to the person reading, so it should survive a
 * navigation and a reload without following a shared link to somebody else.
 */
export const UnitPreferenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // All off on the server and on the first client render so the two agree; the
  // effect below adopts the stored answer once localStorage can be read.
  const [alternateUnits, setAlternateUnits] = useState<MeasureFlags>(NONE);

  useEffect(() => {
    setAlternateUnits(read());
    // The single all-measures flag this replaced. Left behind it would sit in
    // existing browsers forever meaning nothing.
    localStorage.removeItem("showAlternateUnits");
  }, []);

  const setAlternateUnit = useCallback(
    (measure: Measure, showAlternate: boolean) => {
      setAlternateUnits((current) => {
        const next = { ...current, [measure]: showAlternate };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ alternateUnits, setAlternateUnit }),
    [alternateUnits, setAlternateUnit]
  );

  return (
    <UnitPreferenceContext.Provider value={value}>
      {children}
    </UnitPreferenceContext.Provider>
  );
};

export const useUnitPreference = () => useContext(UnitPreferenceContext);
