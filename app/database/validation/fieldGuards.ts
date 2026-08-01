// Server-side validation for the database actions.
//
// Every function under app/database is a Next.js server action, which means it
// is an HTTP endpoint any signed-in client can call with any payload it likes.
// The forms validate, but the forms are not what protects the data -- a
// hand-made request skips them entirely. These guards run inside the action,
// on the way to the query.
//
// Not a "use server" module: helpers called by actions, never from the client.

// Utils
import { isValidEmail } from "../../utils/isValidEmail";

/** A payload the action refuses. Surfaces to the caller as reason "invalid". */
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

/** Text that has to carry something. Returns it trimmed. */
export const assertPresentText = (
  value: string | undefined | null,
  field: string
): string => {
  const trimmed = (value ?? "").trim();

  if (trimmed === "") {
    throw new InvalidInputError(`${field} is required`);
  }

  return trimmed;
};

/**
 * An email address, returned in the one spelling the database stores:
 * lowercased and trimmed. Every write path goes through here, so the unique
 * index on LOWER(user_email) never has two casings to choose between.
 */
export const assertEmailAddress = (
  value: string | undefined | null,
  field = "user_email"
): string => {
  const normalisedEmail = assertPresentText(value, field).toLowerCase();

  if (!isValidEmail(normalisedEmail)) {
    throw new InvalidInputError(`${field} is not a valid email address`);
  }

  return normalisedEmail;
};

/** The earliest date of birth the schema accepts. Keep in step with chk_patient_date_of_birth_plausible. */
const EARLIEST_DATE_OF_BIRTH = "1900-01-01";

/** Today in UTC as YYYY-MM-DD, the timezone every plain date here is pinned to. */
const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

/**
 * A plain calendar date, YYYY-MM-DD, that has already happened.
 *
 * Parsing is deliberately string-first: handing the value to `new Date()` and
 * reading it back re-interprets the day in the server's timezone, which is the
 * shift the rest of this codebase goes to some length to avoid. The value is
 * only turned into a Date to confirm the day exists -- February 31st parses as
 * March 3rd, and comes back rejected.
 */
export const assertPastDate = (
  value: string | undefined | null,
  field: string
): string => {
  const date = assertPresentText(value, field);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new InvalidInputError(`${field} must be a YYYY-MM-DD date`);
  }

  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new InvalidInputError(`${field} is not a real date`);
  }

  // Plain YYYY-MM-DD strings compare correctly as text, so no parsing needed.
  if (date > getTodayIsoDate()) {
    throw new InvalidInputError(`${field} may not be in the future`);
  }

  if (date < EARLIEST_DATE_OF_BIRTH) {
    throw new InvalidInputError(`${field} is before ${EARLIEST_DATE_OF_BIRTH}`);
  }

  return date;
};

/** A boolean that has to have been decided, not left undefined by the form. */
export const assertBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== "boolean") {
    throw new InvalidInputError(`${field} must be true or false`);
  }

  return value;
};

/**
 * Optional free text, trimmed, with a length ceiling matching the VARCHAR(255)
 * columns -- otherwise an over-long value fails as a database error, which the
 * UI reports as "try again" for something retrying cannot fix.
 */
export const assertOptionalText = (
  value: string | undefined | null,
  field: string,
  maximumLength = 255
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length > maximumLength) {
    throw new InvalidInputError(
      `${field} may not be longer than ${maximumLength} characters`
    );
  }

  return trimmed;
};
