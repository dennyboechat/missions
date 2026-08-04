"use client";

// Multivariate Dependencies
import { QRCodeSVG } from "qrcode.react";

// Hooks
import { useOrigin } from "../../../lib/useOrigin";

// Types
import { PatientQrCodeProps } from "../types/PatientQrCodeProps";

// Utils
import { getPatientRecordUrl } from "../../../utils/getPatientRecordUrl";

// Styles
import styles from "../styles/PatientQrCode.module.css";

/* An absolute URL with a UUID in it needs 37 modules, so 72px is a shade under
   2px a module. That is a code held up to, not glanced at: it scans from around
   a hand's width away rather than across a desk. The size is here on its own so
   it can go back up if that turns out to be the wrong trade for the room.

   Error correction stays at the middle level: a screen is a clean surface, but
   the code is read at an angle, off a panel that may be reflecting a window,
   and at this size the redundancy is doing more work than it was. */
const QR_SIZE = 72;
const QR_ERROR_CORRECTION = "M";

/**
 * The patient's record as a code a second device can scan.
 *
 * The point is handover at the chair: a clinician with the record open can turn
 * the screen to a colleague, who arrives on the same patient without anyone
 * reading a UUID aloud or searching the project for a name that has two common
 * spellings.
 *
 * It encodes an absolute URL, which means it can only be built in the browser --
 * the server has no idea which host the page was asked for, and guessing one
 * would hand out a link to the wrong deployment. So the plate is rendered on the
 * first pass and the code fills it once mounted; the plate holds its size either
 * way, so nothing moves when the code appears.
 *
 * Whoever scans it still has to sign in and still has to have the project: the
 * link is a route, not a grant. This is why it is safe to have it on screen.
 *
 * It carries no caption. A QR code is one of the few marks that names itself, so
 * the words under it were only ever telling a reader what they could already
 * see; the title on the code says whose record it opens, for a screen reader and
 * on hover.
 */
export const PatientQrCode = ({
  patientPersonalId,
  patientFullName,
}: PatientQrCodeProps) => {
  const origin = useOrigin();

  if (!patientPersonalId) return null;

  const recordUrl = getPatientRecordUrl({ origin, patientPersonalId });

  return (
    <div className={styles.qr_code}>
      {/* The plate takes its size from this square, not from the code: sizing
          the plate itself to QR_SIZE spent the border-box on the padding and
          left the code hanging over every edge. The square is here rather than
          left to the code so the plate is the same size before the origin
          arrives as it is after. */}
      <div className={styles.plate}>
        <div style={{ width: QR_SIZE, height: QR_SIZE }}>
          {recordUrl && (
            <QRCodeSVG
              value={recordUrl}
              size={QR_SIZE}
              level={QR_ERROR_CORRECTION}
              // The plate's padding is the quiet zone, so the code does not
              // carry a second one inside it and spend resolution on white.
              marginSize={0}
              bgColor="#ffffff"
              // Near-black ink on white. A camera reads the code, not a reader,
              // so this is the one place contrast outranks the palette.
              fgColor="var(--gray-900)"
              title={
                patientFullName
                  ? `QR code opening the record for ${patientFullName}`
                  : "QR code opening this patient's record"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
