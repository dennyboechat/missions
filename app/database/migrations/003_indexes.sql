-- Indexes for the foreign keys and the access lookups.
--
-- Postgres indexes primary keys automatically but not foreign keys, so every
-- join in this schema was a sequential scan. Two things make that worth fixing
-- now: the report queries join four tables and evaluate AT TIME ZONE per row,
-- and the authorisation guard added a project_user lookup to every single
-- server action.
--
-- CREATE INDEX IF NOT EXISTS is safe to re-run. Add CONCURRENTLY if you ever
-- apply this to a table large enough that the write lock matters; at current
-- volumes a plain CREATE INDEX is instant.

-- Access checks: the guard resolves a project, then asks whether the caller
-- owns it or is an active member. Both sides of that get an index.
CREATE INDEX IF NOT EXISTS idx_project_owner_id
  ON project (owner_id);
CREATE INDEX IF NOT EXISTS idx_project_user_project_user
  ON project_user (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_project_user_user_id
  ON project_user (user_id);

-- app_user is looked up by Clerk id on every authenticated action, and by
-- email when inviting a collaborator.
--
-- Deliberately NOT unique. The data currently holds 4 Clerk ids and 1 email
-- appearing twice, from sign-ups that created a second row alongside one made
-- by a project invitation. A unique index would fail to build. See the query
-- at the bottom of this file to review them; the access guard reads all rows
-- for a session so the duplicates no longer cause denials, but they are still
-- worth cleaning up.
CREATE INDEX IF NOT EXISTS idx_app_user_third_party_id
  ON app_user (user_third_party_id);
CREATE INDEX IF NOT EXISTS idx_app_user_email
  ON app_user (user_email);

-- Patient records, walked from project down to prescriptions.
CREATE INDEX IF NOT EXISTS idx_patient_personal_project_id
  ON patient_personal (project_id);
CREATE INDEX IF NOT EXISTS idx_patient_general_patient_personal_id
  ON patient_general (patient_personal_id);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_patient_personal_id
  ON patient_dentistry (patient_personal_id);
CREATE INDEX IF NOT EXISTS idx_patient_general_med_general_id
  ON patient_general_prescribed_medication (patient_general_id);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_med_dentistry_id
  ON patient_dentistry_prescribed_medication (patient_dentistry_id);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_tooth_dentistry_id
  ON patient_dentistry_tooth (patient_dentistry_id);

-- Reports filter appointments by date within a project.
CREATE INDEX IF NOT EXISTS idx_patient_general_appointment_date
  ON patient_general (appointment_date);
CREATE INDEX IF NOT EXISTS idx_patient_dentistry_appointment_date
  ON patient_dentistry (appointment_date);

SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Duplicate app_user rows, for review. Each Clerk id below has more than one
-- row, and typically only one of them carries the project memberships.
-- Merging them means repointing project_user (and project.owner_id, if the
-- duplicate owns anything) at the surviving row before deleting the other --
-- app_user cascades, so deleting first would drop the memberships with it.
SELECT
  u.user_third_party_id,
  u.user_id,
  u.user_email,
  u.created_at,
  (SELECT COUNT(*) FROM project p WHERE p.owner_id = u.user_id) AS owns,
  (SELECT COUNT(*) FROM project_user pu
    WHERE pu.user_id = u.user_id AND pu.is_user_active) AS memberships
FROM app_user u
WHERE u.user_third_party_id IN (
  SELECT user_third_party_id FROM app_user
  WHERE user_third_party_id IS NOT NULL
  GROUP BY 1 HAVING COUNT(*) > 1)
ORDER BY u.user_third_party_id, u.created_at;
