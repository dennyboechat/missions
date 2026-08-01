-- Makes the identities the application already treats as unique actually
-- unique: one app_user per email, one per Clerk id, one membership per
-- (project, user).
--
-- EVERYTHING THIS MIGRATION DOES IS INSIDE THE SINGLE DO BLOCK BELOW.
-- Migration 003 silently did nothing because a query console ran only the
-- first statement, so this one is written as one statement: it either all runs
-- or none of it does. The queries under it are verification, not migration.
--
-- Why it is needed. InsertAppUser, InsertAppUserWithThirdPartyId and
-- InsertProjectUser all guard with "INSERT ... WHERE NOT EXISTS", which is a
-- check followed by an insert. Two requests that interleave both pass the
-- check and both insert. That is how the duplicate app_user rows migration 004
-- had to clean up were created, and nothing in the schema prevents the next
-- ones. Emails made it worse by being case sensitive: an invitation to
-- Denny@idexx.com and a sign-in as denny@idexx.com were two different people
-- as far as the lookups were concerned.
--
-- Safe to re-run: every step is conditional on the state it changes.

DO $$
DECLARE
  merged_by_email INTEGER;
  merged_by_clerk_id INTEGER;
  removed_memberships INTEGER;
BEGIN
  -- 1. One spelling per address, so the unique index below cannot be defeated
  --    by capitalisation.
  UPDATE app_user
  SET user_email = LOWER(BTRIM(user_email))
  WHERE user_email <> LOWER(BTRIM(user_email));

  -- 2. Merge the app_user rows that share an email, keeping the oldest.
  --
  --    Unlike migration 004, this cannot assume the rows it removes hold
  --    nothing: normalising the case above may have just made two rows equal
  --    that were both in use. Ownership and memberships are therefore moved to
  --    the keeper before anything is deleted.
  CREATE TEMP TABLE app_user_merge ON COMMIT DROP AS
  SELECT
    duplicate.user_id AS from_user_id,
    keeper.user_id AS to_user_id
  FROM app_user AS duplicate
  JOIN LATERAL (
    SELECT candidate.user_id
    FROM app_user AS candidate
    WHERE candidate.user_email = duplicate.user_email
    ORDER BY candidate.created_at, candidate.user_id
    LIMIT 1
  ) AS keeper ON keeper.user_id <> duplicate.user_id;

  -- A keeper that was never linked to a Clerk account inherits the link from
  -- the row being removed, otherwise merging would sign that person out of
  -- their own account.
  UPDATE app_user AS keeper
  SET user_third_party_id = donor.user_third_party_id
  FROM app_user_merge
  JOIN app_user AS donor ON donor.user_id = app_user_merge.from_user_id
  WHERE keeper.user_id = app_user_merge.to_user_id
    AND keeper.user_third_party_id IS NULL
    AND donor.user_third_party_id IS NOT NULL;

  UPDATE project
  SET owner_id = app_user_merge.to_user_id
  FROM app_user_merge
  WHERE project.owner_id = app_user_merge.from_user_id;

  UPDATE project_user
  SET user_id = app_user_merge.to_user_id
  FROM app_user_merge
  WHERE project_user.user_id = app_user_merge.from_user_id;

  DELETE FROM app_user
  WHERE user_id IN (SELECT from_user_id FROM app_user_merge);

  GET DIAGNOSTICS merged_by_email = ROW_COUNT;

  -- 3. The same merge keyed on the Clerk id, which is the duplicate 004 found:
  --    one row from an invitation, one from signing in under another address.
  --    Run second so that a chain -- same email as one row, same Clerk id as
  --    another -- collapses onto a single keeper.
  DROP TABLE IF EXISTS app_user_merge;

  CREATE TEMP TABLE app_user_merge ON COMMIT DROP AS
  SELECT
    duplicate.user_id AS from_user_id,
    keeper.user_id AS to_user_id
  FROM app_user AS duplicate
  JOIN LATERAL (
    SELECT candidate.user_id
    FROM app_user AS candidate
    WHERE candidate.user_third_party_id = duplicate.user_third_party_id
    ORDER BY candidate.created_at, candidate.user_id
    LIMIT 1
  ) AS keeper ON keeper.user_id <> duplicate.user_id
  WHERE duplicate.user_third_party_id IS NOT NULL;

  UPDATE project
  SET owner_id = app_user_merge.to_user_id
  FROM app_user_merge
  WHERE project.owner_id = app_user_merge.from_user_id;

  UPDATE project_user
  SET user_id = app_user_merge.to_user_id
  FROM app_user_merge
  WHERE project_user.user_id = app_user_merge.from_user_id;

  DELETE FROM app_user
  WHERE user_id IN (SELECT from_user_id FROM app_user_merge);

  GET DIAGNOSTICS merged_by_clerk_id = ROW_COUNT;

  -- 4. One membership per (project, user). Moving memberships in steps 2 and 3
  --    can itself have produced a pair, and the racing insert could always
  --    produce one. The oldest row survives, and it survives as active if any
  --    of the rows it replaces was active -- losing someone's access here
  --    would be a silent lockout.
  WITH ranked AS (
    SELECT
      project_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY project_id, user_id
        ORDER BY created_at, project_user_id
      ) AS duplicate_rank,
      BOOL_OR(is_user_active) OVER (PARTITION BY project_id, user_id) AS any_active
    FROM project_user
  )
  UPDATE project_user
  SET is_user_active = TRUE
  FROM ranked
  WHERE ranked.project_user_id = project_user.project_user_id
    AND ranked.duplicate_rank = 1
    AND ranked.any_active
    AND NOT project_user.is_user_active;

  WITH ranked AS (
    SELECT
      project_user_id,
      ROW_NUMBER() OVER (
        PARTITION BY project_id, user_id
        ORDER BY created_at, project_user_id
      ) AS duplicate_rank
    FROM project_user
  )
  DELETE FROM project_user
  USING ranked
  WHERE ranked.project_user_id = project_user.project_user_id
    AND ranked.duplicate_rank > 1;

  GET DIAGNOSTICS removed_memberships = ROW_COUNT;

  -- 5. The constraints themselves. From here the racing insert loses at the
  --    database rather than winning silently, and the actions handle the
  --    conflict instead of pre-checking for it.
  --
  --    Keyed on LOWER(user_email) rather than the column so that a writer that
  --    forgets to normalise still collides with the existing row.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_email_unique
    ON app_user (LOWER(user_email));
  CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_third_party_id_unique
    ON app_user (user_third_party_id)
    WHERE user_third_party_id IS NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_project_user_project_user_unique
    ON project_user (project_id, user_id);

  -- Superseded: each is a prefix of, or identical to, a unique index above.
  DROP INDEX IF EXISTS idx_app_user_email;
  DROP INDEX IF EXISTS idx_app_user_third_party_id;
  DROP INDEX IF EXISTS idx_project_user_project_user;

  -- 6. The invariants the forms enforce but the endpoints did not. Every
  --    action under app/database is an HTTP endpoint any signed-in client can
  --    call directly, so "the form would never send that" is not a guarantee.
  --
  --    Added NOT VALID: they bind every insert and update from now on without
  --    requiring a scan of rows written before the rule existed.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_app_user_email_normalised'
  ) THEN
    ALTER TABLE app_user
      ADD CONSTRAINT chk_app_user_email_normalised
      CHECK (user_email = LOWER(BTRIM(user_email)) AND user_email <> '')
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_app_user_name_present'
  ) THEN
    ALTER TABLE app_user
      ADD CONSTRAINT chk_app_user_name_present
      CHECK (BTRIM(user_name) <> '')
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_patient_full_name_present'
  ) THEN
    ALTER TABLE patient_personal
      ADD CONSTRAINT chk_patient_full_name_present
      CHECK (BTRIM(patient_full_name) <> '')
      NOT VALID;
  END IF;

  -- A static floor only. "Not in the future" belongs in the action, because a
  -- CHECK may not call CURRENT_DATE -- it has to hold for a row that is merely
  -- being read back, not only for the moment it was written.
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_patient_date_of_birth_plausible'
  ) THEN
    ALTER TABLE patient_personal
      ADD CONSTRAINT chk_patient_date_of_birth_plausible
      CHECK (patient_date_of_birth IS NULL OR patient_date_of_birth >= DATE '1900-01-01')
      NOT VALID;
  END IF;

  -- 7. Promote the constraints from NOT VALID to validated, which is what lets
  --    the planner trust them. Skipped, with a notice, if any row written
  --    before the rule existed breaks it: the rule still binds every new write
  --    either way, and failing here would undo the whole migration over data
  --    that predates it. Clean those rows and re-run to finish the job.
  BEGIN
    ALTER TABLE app_user VALIDATE CONSTRAINT chk_app_user_email_normalised;
    ALTER TABLE app_user VALIDATE CONSTRAINT chk_app_user_name_present;
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'app_user constraints left NOT VALID: existing rows break them';
  END;

  BEGIN
    ALTER TABLE patient_personal VALIDATE CONSTRAINT chk_patient_full_name_present;
    ALTER TABLE patient_personal VALIDATE CONSTRAINT chk_patient_date_of_birth_plausible;
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'patient_personal constraints left NOT VALID: existing rows break them';
  END;

  RAISE NOTICE 'app_user rows merged by email: %', merged_by_email;
  RAISE NOTICE 'app_user rows merged by Clerk id: %', merged_by_clerk_id;
  RAISE NOTICE 'duplicate memberships removed: %', removed_memberships;
END $$;

-- Verification. Every one of these should come back empty.

-- Emails appearing more than once, in any casing.
SELECT LOWER(BTRIM(user_email)) AS user_email, COUNT(*)
FROM app_user
GROUP BY 1
HAVING COUNT(*) > 1;

-- Clerk ids appearing more than once.
SELECT user_third_party_id, COUNT(*)
FROM app_user
WHERE user_third_party_id IS NOT NULL
GROUP BY 1
HAVING COUNT(*) > 1;

-- Memberships appearing more than once.
SELECT project_id, user_id, COUNT(*)
FROM project_user
GROUP BY 1, 2
HAVING COUNT(*) > 1;

-- Projects or memberships left pointing at an app_user that no longer exists.
SELECT 'project' AS source, project_id AS id FROM project
WHERE owner_id NOT IN (SELECT user_id FROM app_user)
UNION ALL
SELECT 'project_user', project_user_id FROM project_user
WHERE user_id NOT IN (SELECT user_id FROM app_user);

-- The indexes and constraints this migration adds, for confirmation.
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE '%_unique'
ORDER BY indexname;

SELECT conname, convalidated FROM pg_constraint
WHERE conname LIKE 'chk_%'
ORDER BY conname;
