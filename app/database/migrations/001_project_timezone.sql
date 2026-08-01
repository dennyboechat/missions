-- Adds a per-project IANA timezone and backfills the existing projects.
--
-- Why: reports used to bucket appointments by UTC calendar day, because the
-- timezone was read with Intl.DateTimeFormat() inside a "use server" module,
-- which resolves to the Vercel runtime zone (UTC) rather than anyone's actual
-- location. In Fiji (UTC+12) the UTC day boundary falls at noon local time, so
-- every clinic day was split across two rows. Grouping by the project's own
-- zone fixes that and keeps a report identical no matter where it is opened.
--
-- Stored appointment_date values are correct absolute instants and are NOT
-- touched by this migration.

ALTER TABLE project
  ADD COLUMN IF NOT EXISTS project_timezone VARCHAR(64) NOT NULL DEFAULT 'UTC';

-- Backfill the known projects. Adjust the project_name matches to your data.
UPDATE project SET project_timezone = 'Pacific/Fiji'
  WHERE project_name ILIKE '%fiji%';

UPDATE project SET project_timezone = 'Indian/Antananarivo'
  WHERE project_name ILIKE '%madagascar%';

UPDATE project SET project_timezone = 'Pacific/Auckland'
  WHERE project_name ILIKE '%test%';

-- Any project not matched above keeps 'UTC', which preserves the previous
-- behaviour rather than silently guessing a zone for it.
SELECT project_id, project_name, project_timezone FROM project ORDER BY created_at;
