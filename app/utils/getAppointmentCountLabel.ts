/**
 * How many appointments a patient has had on this mission, as the line under the
 * heading on the General and Dental tabs.
 *
 * An unknown count is an empty line rather than a zero. The two are a keystroke
 * apart to write and opposite to read: the tab renders before its query comes
 * back, and "0 appointments" in that gap tells a clinician the patient has never
 * been seen -- about a patient who may have been seen this morning. Blank says
 * only that the number is not in yet, which is the truth.
 *
 * The empty string is deliberate, and not undefined: ContentHeader keeps the
 * line's height when it is given one, so the heading does not step down when the
 * figure lands.
 */
export const getAppointmentCountLabel = ({ count }: { count?: number }) => {
  if (count === undefined) {
    return "";
  }

  return `${count} ${count === 1 ? "appointment" : "appointments"} on this mission.`;
};
