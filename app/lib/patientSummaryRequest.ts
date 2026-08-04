"use client";

// Database
import { getPatientSummary } from "../database/patient-summary/GetPatientSummary";

// Types
import { ActionResult } from "../types/ActionResult";
import { PatientPersonalSummary } from "../types/PatientPersonalSummary";

/**
 * How the patient sidebar gets its name and date of birth before the database
 * answers, by two routes that cover different arrivals.
 *
 * The problem both address: Next serialises server actions -- one POST at a time,
 * in call order -- and React runs effects child first. Between them, a sidebar
 * that loads in a layout is served last, because every query the page underneath
 * it fires is already in the queue by the time the layout's effect runs. Measured
 * on a patient record, the name arrived a full second and a half after the page,
 * for a query that takes 440ms alone.
 *
 * Nothing here is persisted. It is a patient's name, date of birth and phone
 * number on a device that may be shared and may be left on a table; it lives in
 * this module for as long as the tab does and goes no further. Reloading the page
 * is enough to clear it, and it is meant to be.
 */

type SummaryRequest = Promise<ActionResult<PatientPersonalSummary>>;

/** One in-flight read per patient, so early and late askers share a request. */
const requests = new Map<string, SummaryRequest>();

/** What the patients list already knew, kept for the record it links to. */
const known = new Map<string, PatientPersonalSummary>();

/**
 * Route one: the patients list has already read every field the sidebar shows, so
 * a record opened from that list needs no wait at all.
 *
 * The row the clinician just clicked is the row they were reading a moment ago, so
 * showing it back to them is not a guess. The record's own read still follows and
 * still wins -- this covers the interval before it lands, which is the interval
 * that was blank.
 */
export const rememberPatientSummaries = (
  patients: PatientPersonalSummary[],
) => {
  for (const patient of patients) {
    if (patient.patientPersonalId) {
      known.set(patient.patientPersonalId, patient);
    }
  }
};

/** What the list knew about this patient, if the reader came in through it. */
export const recallPatientSummary = (
  patientPersonalId?: string,
): PatientPersonalSummary | undefined =>
  patientPersonalId ? known.get(patientPersonalId) : undefined;

/**
 * Route two: a record opened cold -- a scanned QR code, a pasted link, a reload --
 * where nothing is remembered and the read has to happen.
 *
 * Called from render, which needs saying because a request is not what a render is
 * usually for. Render order is the reverse of effect order: a layout renders
 * before the page inside it, and both render before any effect. Asking here puts
 * the summary at the front of the action queue instead of the back.
 *
 * Safe to call repeatedly -- the map makes it idempotent per patient, which is
 * what lets it sit in a render React may run more than once: twice on mount in
 * development, and again on any state change before the answer arrives.
 *
 * Callers are responsible for `forgetPatientSummaryRequest`, so that returning to
 * a record later reads it again instead of reusing the last visit's answer.
 */
export const startPatientSummary = (
  patientPersonalId?: string,
): SummaryRequest | undefined => {
  if (!patientPersonalId) {
    return undefined;
  }

  const existing = requests.get(patientPersonalId);

  if (existing) {
    return existing;
  }

  // Dropped once it settles, so returning to this record later reads it again
  // instead of handing back an answer from the last visit. Only the wait is being
  // saved here, never the record.
  const request = getPatientSummary({ patientPersonalId }).finally(() => {
    requests.delete(patientPersonalId);
  });

  requests.set(patientPersonalId, request);

  return request;
};
