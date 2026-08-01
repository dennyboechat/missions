-- Merges the duplicate app_user rows.
--
-- THE DELETE IS THE FIRST STATEMENT. Everything below it is verification --
-- some query consoles run only the first statement, which is how migration 003
-- appeared to succeed without applying.
--
-- How the duplicates happen: a project owner invites someone by one address,
-- which creates an app_user row carrying the membership; that person then
-- signs in with a different address on their Clerk account, creating a second
-- row. Four Clerk ids are affected, and in every case the older row holds the
-- membership and the newer one holds nothing.
--
-- Verified before writing this: app_user is referenced only by
-- project.owner_id and project_user.user_id, and each row being deleted has
-- zero of both -- including inactive project_user links. Nothing needs
-- repointing, so this is a plain delete rather than a merge.
--
-- The guards in the WHERE clause re-check all of that at run time, so the
-- statement cannot remove a row that has since acquired a project or a
-- membership. It is safe to re-run: a second run matches nothing.

DELETE FROM app_user AS duplicate
WHERE duplicate.user_third_party_id IS NOT NULL
  -- an older row exists for the same Clerk account
  AND EXISTS (
    SELECT 1 FROM app_user AS original
    WHERE original.user_third_party_id = duplicate.user_third_party_id
      AND original.created_at < duplicate.created_at
  )
  -- and this row owns nothing
  AND NOT EXISTS (
    SELECT 1 FROM project WHERE project.owner_id = duplicate.user_id
  )
  -- and belongs to nothing, active or otherwise
  AND NOT EXISTS (
    SELECT 1 FROM project_user WHERE project_user.user_id = duplicate.user_id
  );

-- ---------------------------------------------------------------------------
-- Verification below. Run separately if your console stops at the first
-- statement.
-- ---------------------------------------------------------------------------

-- Expect zero rows.
SELECT user_third_party_id, COUNT(*) AS rows
FROM app_user
WHERE user_third_party_id IS NOT NULL
GROUP BY 1
HAVING COUNT(*) > 1;

-- Expect every previously affected user to still hold their membership.
SELECT u.user_email, COUNT(pu.project_user_id) AS memberships
FROM app_user u
LEFT JOIN project_user pu ON pu.user_id = u.user_id AND pu.is_user_active
WHERE u.user_email IN (
  'easiregar@puc.edu', 'erudarbe@puc.edu',
  'jwwheeler61@gmail.com', 'rahgaviola@puc.edu')
GROUP BY 1
ORDER BY 1;

-- ---------------------------------------------------------------------------
-- Optional, and a deliberate behaviour change: stop the duplicates recurring
-- at the database level. Only buildable once the delete above has run.
--
-- With this in place a second row for the same Clerk account raises an error
-- instead of being created silently. The sign-up insert already guards with
-- NOT EXISTS, so the normal path is unaffected -- but a race would now surface
-- as a failure rather than a duplicate.
-- ---------------------------------------------------------------------------

-- CREATE UNIQUE INDEX IF NOT EXISTS idx_app_user_third_party_id_unique
--   ON app_user (user_third_party_id);
