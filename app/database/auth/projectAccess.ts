// Server-side authorisation for the database actions.
//
// Every function under app/database is a Next.js server action, which means it
// is an HTTP endpoint any signed-in client can call with any id it likes.
// Hiding a menu item does not restrict it. These helpers resolve the caller
// from the Clerk session and check them against the project that owns the
// record being touched, so authorisation does not depend on the UI.
//
// Not a "use server" module: these are helpers called by actions, never
// invoked from the client.

// Auth
import { auth, currentUser } from "@clerk/nextjs/server";

// Database
import { sql } from "@vercel/postgres";

export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

/**
 * The caller's Clerk id. Used by the sign-up actions, which run before the
 * app_user row exists and so cannot use getAuthenticatedUserId.
 */
export const getClerkUserId = async (): Promise<string> => {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new AccessDeniedError("Not signed in");
  }

  return clerkUserId;
};

/** The caller's verified primary email, straight from Clerk. */
export const getClerkPrimaryEmail = async (): Promise<string> => {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new AccessDeniedError("Session has no primary email address");
  }

  return email;
};

/**
 * Every app_user row belonging to the caller, oldest first.
 *
 * Normally one, but the sign-up path has produced duplicate rows for the same
 * Clerk id -- typically one created by a project invitation and another on
 * first sign-in with a different email. When that happens the rows do not
 * share memberships, so resolving to a single arbitrary row would deny a user
 * access to their own project. Access is therefore checked against all of
 * them.
 */
export const getAuthenticatedUserIds = async (): Promise<string[]> => {
  const clerkUserId = await getClerkUserId();

  const response = await sql.query(
    `SELECT user_id FROM app_user
     WHERE user_third_party_id = $1
     ORDER BY created_at`,
    [clerkUserId]
  );

  if (response.rows.length === 0) {
    throw new AccessDeniedError("No application user for this session");
  }

  return response.rows.map((row) => row.user_id);
};

/**
 * The caller's primary app_user.user_id -- the oldest row, so the answer is
 * stable across sessions. Use for assigning ownership; use
 * getAuthenticatedUserIds for anything that reads existing access.
 */
export const getAuthenticatedUserId = async (): Promise<string> =>
  (await getAuthenticatedUserIds())[0];

// Each scope is an id the actions already receive, resolved back to the
// project that ultimately owns it.
export interface ProjectScope {
  projectId?: string;
  patientPersonalId?: string;
  patientGeneralId?: string;
  patientDentistryId?: string;
  patientGeneralPrescribedMedicationId?: string;
  patientDentistryPrescribedMedicationId?: string;
  patientDentistryToothId?: string;
  projectUserId?: string;
}

const PROJECT_ID_QUERY: Record<keyof ProjectScope, string> = {
  projectId: `
    SELECT $1::uuid AS project_id`,
  patientPersonalId: `
    SELECT project_id
    FROM patient_personal
    WHERE patient_personal_id = $1::uuid`,
  patientGeneralId: `
    SELECT patient_personal.project_id
    FROM patient_general
    JOIN patient_personal ON patient_personal.patient_personal_id = patient_general.patient_personal_id
    WHERE patient_general.patient_general_id = $1::uuid`,
  patientDentistryId: `
    SELECT patient_personal.project_id
    FROM patient_dentistry
    JOIN patient_personal ON patient_personal.patient_personal_id = patient_dentistry.patient_personal_id
    WHERE patient_dentistry.patient_dentistry_id = $1::uuid`,
  patientGeneralPrescribedMedicationId: `
    SELECT patient_personal.project_id
    FROM patient_general_prescribed_medication med
    JOIN patient_general ON patient_general.patient_general_id = med.patient_general_id
    JOIN patient_personal ON patient_personal.patient_personal_id = patient_general.patient_personal_id
    WHERE med.patient_general_prescribed_medication_id = $1::uuid`,
  patientDentistryPrescribedMedicationId: `
    SELECT patient_personal.project_id
    FROM patient_dentistry_prescribed_medication med
    JOIN patient_dentistry ON patient_dentistry.patient_dentistry_id = med.patient_dentistry_id
    JOIN patient_personal ON patient_personal.patient_personal_id = patient_dentistry.patient_personal_id
    WHERE med.patient_dentistry_prescribed_medication_id = $1::uuid`,
  patientDentistryToothId: `
    SELECT patient_personal.project_id
    FROM patient_dentistry_tooth tooth
    JOIN patient_dentistry ON patient_dentistry.patient_dentistry_id = tooth.patient_dentistry_id
    JOIN patient_personal ON patient_personal.patient_personal_id = patient_dentistry.patient_personal_id
    WHERE tooth.patient_dentistry_tooth_id = $1::uuid`,
  projectUserId: `
    SELECT project_id
    FROM project_user
    WHERE project_user_id = $1::uuid`,
};

/**
 * Throws unless the caller may act on the project the scope belongs to.
 *
 * `ownerOnly` covers project administration -- deleting a project, editing its
 * settings, managing its users. Everything else is open to active members too,
 * since that is the clinical work they were added to do.
 *
 * Returns the resolved project id so callers can reuse it.
 *
 * Resolving the caller and checking their access is one query rather than two.
 * Every action under app/database calls this before its own query, so a second
 * round trip here was a third of the wait on every screen -- and the database
 * is remote, so a round trip is most of the cost, not the query. The anchor
 * row is what keeps it to one: both CTEs may be empty, and LEFT JOINs onto a
 * single row still return one, so "no such user" and "no such project" stay
 * distinguishable without asking twice.
 */
export const assertProjectAccess = async (
  scope: ProjectScope,
  { ownerOnly = false }: { ownerOnly?: boolean } = {}
): Promise<string> => {
  const entries = Object.entries(scope).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  if (entries.length !== 1) {
    throw new AccessDeniedError(
      `Expected exactly one scope id, received ${entries.length}`
    );
  }

  const [key, value] = entries[0] as [keyof ProjectScope, string];
  const clerkUserId = await getClerkUserId();

  const response = await sql.query(
    `
      WITH caller AS (
        SELECT user_id FROM app_user WHERE user_third_party_id = $2
      ),
      scoped AS (${PROJECT_ID_QUERY[key]})
      SELECT
        (SELECT count(*) FROM caller)::int AS caller_count,
        project.project_id,
        EXISTS (
          SELECT 1 FROM caller WHERE caller.user_id = project.owner_id
        ) AS is_owner,
        EXISTS (
          SELECT 1
          FROM project_user
          JOIN caller ON caller.user_id = project_user.user_id
          WHERE project_user.project_id = project.project_id
            AND project_user.is_user_active = TRUE
        ) AS is_member
      FROM (SELECT 1) AS anchor
      LEFT JOIN scoped ON TRUE
      LEFT JOIN project ON project.project_id = scoped.project_id
    `,
    [value, clerkUserId]
  );

  const {
    caller_count: callerCount,
    project_id: projectId,
    is_owner: isOwner,
    is_member: isMember,
  } = response.rows[0];

  if (callerCount === 0) {
    throw new AccessDeniedError("No application user for this session");
  }

  if (!projectId) {
    throw new AccessDeniedError(`No project found for ${key}`);
  }

  if (ownerOnly ? !isOwner : !isOwner && !isMember) {
    throw new AccessDeniedError(
      `User ${clerkUserId} may not access project ${projectId}${
        ownerOnly ? " as owner" : ""
      }`
    );
  }

  return projectId;
};
