"use client";

// Multivariate Dependencies
import { createContext, useContext } from "react";

// Types
import { PatientPersonalSummary } from "../types/PatientPersonalSummary";

interface PatientContextType {
  patient?: PatientPersonalSummary;
  setPatient: (patient?: PatientPersonalSummary) => void;
}

const PatientContext = createContext<PatientContextType>({
  patient: undefined,
  setPatient: () => {},
});

export const PatientProvider = PatientContext.Provider;

/**
 * The patient the current page is about, fetched once by the patient layout.
 *
 * Every tab needs the same name, date of birth and gender for the sidebar, and
 * two of them re-fetched it for their own use as well. Sharing it removes a
 * round trip per page and keeps the sidebar in step when a field is edited.
 */
export const usePatient = () => useContext(PatientContext);
