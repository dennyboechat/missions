/**
 * The link that opens a patient's record, whole enough for another device.
 *
 * Everywhere else in the product a patient is a path -- `/patient-summary/:id`
 * -- because the browser already knows the host. A QR code does not have that
 * luxury: it is read by a phone that has no idea which deployment the screen it
 * is pointed at belongs to, so the host has to travel with it.
 *
 * The origin is the caller's to supply. Only the browser knows it, and a link
 * built from a guessed one is worse than no link: it scans cleanly and lands on
 * someone else's deployment.
 */
export const getPatientRecordUrl = ({
  origin,
  patientPersonalId,
}: {
  origin?: string;
  patientPersonalId?: string;
}) => {
  if (!origin || !patientPersonalId) {
    return "";
  }

  // A trailing slash on the origin would put a double one in the middle of the
  // path. Harmless in a browser, but the code encodes exactly what it is given
  // and there is no reason for it to carry a typo.
  return `${origin.replace(/\/$/, "")}/patient-summary/${patientPersonalId}`;
};
