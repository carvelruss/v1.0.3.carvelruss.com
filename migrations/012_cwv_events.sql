-- Core Web Vitals real-user monitoring
CREATE TABLE IF NOT EXISTS cwv_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  metric     TEXT    NOT NULL,
  value      REAL    NOT NULL,
  rating     TEXT    NOT NULL,
  path       TEXT,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cwv_metric   ON cwv_events (metric, created_at);
CREATE INDEX IF NOT EXISTS idx_cwv_created  ON cwv_events (created_at);
