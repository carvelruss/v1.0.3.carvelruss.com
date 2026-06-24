-- CTA clicks, form funnel, scroll depth events
CREATE TABLE IF NOT EXISTS cta_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT    NOT NULL,
  label      TEXT,
  path       TEXT,
  session_id TEXT,
  value      INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cta_created ON cta_events (created_at);
CREATE INDEX IF NOT EXISTS idx_cta_type    ON cta_events (event_type, label);
