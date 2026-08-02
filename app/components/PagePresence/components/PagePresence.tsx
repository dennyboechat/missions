"use client";

// Components
import { Tooltip } from "@radix-ui/themes";

// Types
import { PageViewer } from "../../../types/PagePresence";

// Utils
import { getInitials } from "../../../utils/getInitials";
import { joinWithAnd } from "../../../utils/joinWithAnd";

// Styles
import styles from "../styles/PagePresence.module.css";

/**
 * Beyond three, the discs stop being readable and start being a smudge, so the
 * rest collapse into a count that names them all on hover.
 */
const VISIBLE_AVATARS = 3;

/* Stable per person, so the same colleague is the same colour on every screen
   and can be recognised before the name is read. Drawn from the logo's own pin
   hues; all six carry white text at the weight used here. */
const AVATAR_COLORS = [
  "var(--sky-600)",
  "var(--green-600)",
  "var(--rose-500)",
  "var(--clay-600)",
  "var(--rose-700)",
  "var(--sky-800)",
];

const getAvatarColor = (userId: string) => {
  // Any stable spread over the palette will do -- this is decoration, not
  // identity, and it never has to survive a schema change.
  const fingerprint = Array.from(userId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return AVATAR_COLORS[fingerprint % AVATAR_COLORS.length];
};

const describeViewer = ({ userName, resourceLabel }: PageViewer) =>
  `${userName} — ${resourceLabel}`;

/**
 * Who else has this record open, as a row of initials in the top bar.
 *
 * It sits next to Back because that is where the header already says what you
 * are looking at, and because being global means every screen gets it without
 * a page having to remember to ask.
 *
 * Renders nothing when you are alone, which is almost always. A permanent
 * "nobody else is here" would be a line of chrome that is only ever noise, and
 * the appearance of a face is the signal worth noticing.
 */
export const PagePresence = ({ viewers }: { viewers: PageViewer[] }) => {
  if (viewers.length === 0) {
    return null;
  }

  const shownViewers = viewers.slice(0, VISIBLE_AVATARS);
  const hiddenViewers = viewers.slice(VISIBLE_AVATARS);

  return (
    <div className={styles.presence}>
      <div className={styles.stack}>
        {shownViewers.map((viewer) => (
          <Tooltip key={viewer.userId} content={describeViewer(viewer)}>
            <span
              className={styles.avatar}
              style={{ background: getAvatarColor(viewer.userId) }}
              // The tooltip is a pointer affordance; the group below carries
              // the same information for anyone not using one.
              aria-hidden
            >
              {getInitials(viewer.userName)}
            </span>
          </Tooltip>
        ))}
        {hiddenViewers.length > 0 && (
          <Tooltip content={joinWithAnd(hiddenViewers.map(describeViewer))}>
            <span
              className={`${styles.avatar} ${styles.overflow}`}
              aria-hidden
            >
              {`+${hiddenViewers.length}`}
            </span>
          </Tooltip>
        )}
      </div>
      <span className={styles.label} aria-hidden>
        {"also here"}
      </span>
      <span role="status" className={styles.visually_hidden}>
        {`${joinWithAnd(viewers.map(describeViewer))} ${
          viewers.length === 1 ? "also has" : "also have"
        } this record open.`}
      </span>
    </div>
  );
};
