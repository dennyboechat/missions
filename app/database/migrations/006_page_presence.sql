-- Who is looking at what, right now.
--
-- Records are edited field by field and the last write wins, so two clinicians
-- on the same patient can quietly overwrite each other. The pages now refresh
-- themselves, which makes that collision visible after the fact; this table is
-- what makes it avoidable beforehand, by naming the other people in the record
-- in the header.
--
-- Presence is ephemeral state, which normally argues for Redis rather than a
-- relation. It lives here anyway because the alternative is a second service
-- for one small fact, and the shape below keeps the cost of that decision
-- fixed rather than growing:
--
--   * one row per (user, resource) -- a heartbeat updates its own row rather
--     than appending, so the table is bounded by people times open pages and
--     never needs a sweep to stay small;
--   * no history, no audit intent. It answers "who is here" and nothing else.
--     Anything worth keeping about who touched a record belongs in a real
--     audit trail, not in a table that forgets after thirty seconds.
--
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS page_presence (
    user_id UUID NOT NULL,
    project_id UUID NOT NULL,
    -- What is being shared, not which tab: 'patient:<uuid>' so that everyone
    -- inside one patient's record can see each other across Summary, General,
    -- Dental and Personal. Two people on the same patient are worth knowing
    -- about even when they are on different tabs.
    resource_key VARCHAR(255) NOT NULL,
    -- Where in it they are, e.g. 'Dental'. Denormalised so the roster is a
    -- single query and the client never parses a key back into a name.
    resource_label VARCHAR(64) NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Moving between tabs of the same record updates this row instead of
    -- leaving a trail of stale ones behind.
    PRIMARY KEY (user_id, resource_key),
    CONSTRAINT fk_page_presence_user
      FOREIGN KEY(user_id) REFERENCES app_user(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_page_presence_project
      FOREIGN KEY(project_id) REFERENCES project(project_id) ON DELETE CASCADE
);

-- The only read: everyone recently seen on one resource. Both columns are in
-- the index so the freshness cut-off is served without touching the table.
CREATE INDEX IF NOT EXISTS idx_page_presence_resource_last_seen
  ON page_presence (resource_key, last_seen_at);

-- Rows for people who closed a tab without the browser managing a goodbye stop
-- being read the moment they go stale, so nothing here is urgent. Run it if the
-- table ever looks untidy; a mission that ended last year leaves a handful of
-- rows, not a problem.
--
-- DELETE FROM page_presence
-- WHERE last_seen_at < CURRENT_TIMESTAMP - INTERVAL '1 day';
