-- Project admins.
--
-- Until now a project had exactly one person who could change it. Everyone else
-- was a member: they could do the clinical work and nothing else. On a mission
-- that runs for weeks, with the owner in a different timezone or simply in a
-- clinic, "only one person can add a nurse" is a bottleneck that gets worked
-- around by sharing the owner's login -- which is worse than the problem.
--
-- An admin can do everything the owner can except delete the project. Deletion
-- cascades to every patient, appointment and prescription, and is the one act
-- with no undo, so it stays with the single person who answers for the project.
--
-- A boolean rather than a role column: this table already reads
-- is_user_active, and the ranking is owner > admin > member with the owner held
-- on project.owner_id, not here. Should a third rank ever be needed this
-- becomes an enum; two do not justify one now.
--
-- Admin power is deliberately conditional on is_user_active. Deactivating
-- someone is how access is withdrawn, and it has to withdraw all of it -- a
-- deactivated admin keeping the run of the project would make the switch a
-- lie. See assertProjectAccess, which requires both.
--
-- Existing rows become members, which is what they already were.
--
-- Safe to re-run.

ALTER TABLE project_user
  ADD COLUMN IF NOT EXISTS is_user_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- No new index. Every read of this column is already reached through
-- (project_id, user_id) -- the unique index from 005_unique_identities.sql --
-- so it is a column on a row that has been found, not something searched by.
