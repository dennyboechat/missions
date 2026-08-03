-- Who changed what, and what it was before.
--
-- The app had no answer to that. Nothing recorded an author or a time of change:
-- a weight that looked wrong could not be traced to the person who typed it, and
-- a record that went missing could not be distinguished from one that was never
-- created. On a mission staffed by rotating volunteers, "who entered this" is a
-- clinical question, not an administrative one.
--
-- One row per write, including each field save. A vitals form produces a dozen,
-- which is the point: the trail is the record of what happened, not a summary of
-- it, and a summary cannot be reconstructed into the individual changes while the
-- reverse is always possible.
--
-- The before and after values are kept. That does mean a deleted patient's
-- figures survive here after the record itself is gone, which is the deliberate
-- trade an audit trail makes -- and the reason the retention note at the bottom of
-- this file matters. It widens no access: the trail is readable only by the
-- project's admins, who can already read every record in it.
--
-- Both names are denormalised on purpose. An event that says "user 3f6b… deleted
-- patient 9a11…" is unreadable precisely when it is most needed, because the rows
-- it names are the ones that are gone. Storing the names at write time is what
-- keeps a deletion legible afterwards.
--
-- Values are TEXT rather than typed: one table carries a temperature, a drug
-- name, a date of birth and a boolean, and the trail only ever displays them.
--
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS audit_event (
    audit_event_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- Whose trail this is. Every event belongs to exactly one project, which is
    -- what the audit page is scoped to and what its admin check is made against.
    project_id UUID NOT NULL,
    -- The author. Nullable and SET NULL on delete, so removing an account does
    -- not quietly rewrite history -- actor_name is what keeps the row readable.
    actor_user_id UUID,
    actor_name VARCHAR(255),
    -- added | changed | deleted. A CHECK rather than trust: these three are what
    -- the page groups and filters by.
    action VARCHAR(8) NOT NULL,
    -- What kind of thing was touched, in the words the app uses on screen:
    -- 'patient', 'general appointment', 'prescription', 'tooth', 'project user'.
    entity VARCHAR(48) NOT NULL,
    -- The row itself, where it still exists. Not a foreign key: half the point of
    -- the trail is the rows that no longer do.
    entity_id UUID,
    -- The patient the event was about, for reading and filtering the trail by
    -- person. Null for project-level events -- settings, users.
    patient_personal_id UUID,
    patient_name VARCHAR(255),
    -- For a change: which column, and what it went from and to. Null on an
    -- addition or a deletion, where the event is the whole record.
    field VARCHAR(64),
    value_before TEXT,
    value_after TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_audit_event_action
      CHECK (action IN ('added', 'changed', 'deleted')),
    -- Deleting a project takes its trail with it. The project is the tenant
    -- boundary: keeping orphaned events would leave patient values behind with
    -- nothing left that has the right to read them.
    CONSTRAINT fk_audit_event_project
      FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_event_actor
      FOREIGN KEY(actor_user_id) REFERENCES app_user(user_id) ON DELETE SET NULL
);

-- The page reads one project's events newest first, and nothing else does. The
-- index carries the sort so paging back through a mission's history does not sort
-- the whole table each time.
CREATE INDEX IF NOT EXISTS idx_audit_event_project_created
  ON audit_event (project_id, created_at DESC);

-- Reading one patient's history, which is the filter the page offers.
CREATE INDEX IF NOT EXISTS idx_audit_event_patient_created
  ON audit_event (patient_personal_id, created_at DESC);

-- Retention is deliberately not implemented here. This table only grows, and at
-- one row per field save it grows faster than anything else in the schema. What
-- the right horizon is -- a mission, a year, whatever a data protection policy
-- says -- is a decision for whoever runs the deployment, not a default to bury in
-- a migration. When there is an answer, it is one DELETE on created_at.
