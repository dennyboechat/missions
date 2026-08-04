"use client";

// Multivariate Dependencies
import { QRCodeSVG } from "qrcode.react";

// Hooks
import { useOrigin } from "../../../lib/useOrigin";
import { useProjectFormats } from "../../../lib/useProjectFormats";

// Types
import { PatientLabelProps } from "../types/PatientLabelProps";

// Utils
import { getPatientRecordUrl } from "../../../utils/getPatientRecordUrl";
import { getGenderLabel } from "../../../utils/getGenderLabel";

// Styles
import styles from "../styles/PatientLabel.module.css";

/* Error correction goes up a level from the sidebar's. Paper is the difference:
   this card goes in a pocket, gets damp, gets creased, and Q recovers a quarter
   of the code against M's seventh.

   It is not free. Q spends the redundancy on more modules -- 41 across for a URL
   this length, against M's 37 -- and every one of them is smaller at a fixed
   printed width. The stylesheet pays for it in millimetres: 30mm across 41
   modules leaves each one at 0.73mm, which is what a phone reads off paper
   held at reading distance. Shrink the card or drop that figure and this is the
   trade to reconsider, in that order.

   The size below is only the SVG's own width attribute, which the stylesheet
   overrides; the module count comes from the URL and the level, not from here.
   It exists so the element has honest intrinsic dimensions before CSS applies. */
const QR_FALLBACK_SIZE = 128;
const QR_ERROR_CORRECTION = "Q";

/**
 * A patient's own copy of their record, as a card they carry.
 *
 * Everything on it is what a clinician would otherwise ask for out loud and a
 * patient would otherwise remember: the name as it is spelled on the record, the
 * date of birth, the sex, a phone number. Under that, the code that opens the
 * record itself, so the next person to see this patient does not start by
 * searching a project for a name with two common spellings.
 *
 * Sized as a wallet card and printed with a cut line, because the printer in a
 * mission is whatever printer is in the room. It goes on plain paper, at exact
 * millimetres, and the line says where the scissors go.
 *
 * On screen it is the same element at the same size -- what the dialog shows is
 * the card, not an illustration of it.
 *
 * The link is a route, not a grant: whoever scans it still has to sign in and
 * still has to be on the project. That is what makes it safe to hand over.
 */
export const PatientLabel = ({
  patientPersonalId,
  patient,
  projectName,
}: PatientLabelProps) => {
  const origin = useOrigin();
  const { formatDate } = useProjectFormats();

  const recordUrl = getPatientRecordUrl({ origin, patientPersonalId });

  const {
    patientFullName,
    patientDateOfBirth,
    isPatientMale,
    patientPhoneNumber,
  } = patient ?? {};

  /* The date of birth, and deliberately not the age beside it.
   *
   * Everywhere else in the product the two travel together, because everywhere
   * else they are read on the day they are computed. This card is kept: it goes
   * in a wallet and comes back out months later, by which time a printed age is
   * simply wrong, and wrong in a way that reads as authoritative because it is
   * on a card. The date of birth is the fact; the age is a view of it, and only
   * the screen is entitled to that view.
   *
   * Each line is only written if it is known. A card is read by someone who was
   * not in the room, so a blank where a phone number should be is information,
   * and a lone dash is not. */
  const dateOfBirth = patientDateOfBirth ? formatDate(patientDateOfBirth) : "";

  const gender =
    isPatientMale === undefined ? "" : getGenderLabel({ isPatientMale });

  return (
    <div className={styles.card}>
      <div className={styles.details}>
        {/* The mission over the name, set small: it says where this card came
            from, which is context for everything under it rather than the thing
            being read. */}
        {projectName && <p className={styles.mission}>{projectName}</p>}
        <p className={styles.name}>{patientFullName}</p>
        <dl className={styles.fields}>
          {dateOfBirth && (
            <>
              <dt className={styles.field_label}>{"Born"}</dt>
              <dd className={styles.field_value_numeric}>{dateOfBirth}</dd>
            </>
          )}
          {gender && (
            <>
              <dt className={styles.field_label}>{"Sex"}</dt>
              <dd className={styles.field_value}>{gender}</dd>
            </>
          )}
          {patientPhoneNumber && (
            <>
              <dt className={styles.field_label}>{"Phone"}</dt>
              <dd className={styles.field_value_numeric}>
                {patientPhoneNumber}
              </dd>
            </>
          )}
        </dl>
      </div>

      {/* The plate holds the code's quiet zone, the same as in the sidebar: a
          camera reads a QR off the contrast between its modules and a clear
          field, and the standard asks for that field to stay clear. */}
      <div className={styles.plate}>
        {recordUrl && (
          <QRCodeSVG
            value={recordUrl}
            size={QR_FALLBACK_SIZE}
            level={QR_ERROR_CORRECTION}
            marginSize={0}
            bgColor="#ffffff"
            // Near-black ink on white. A camera reads this, not a reader, so
            // contrast outranks the palette here.
            fgColor="var(--gray-900)"
            className={styles.qr_code}
            title={
              patientFullName
                ? `QR code opening the record for ${patientFullName}`
                : "QR code opening this patient's record"
            }
          />
        )}
      </div>
    </div>
  );
};
