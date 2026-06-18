-- ── Projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  tech         TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  role         TEXT    NOT NULL DEFAULT '',
  live_url     TEXT,
  case_study_url TEXT,
  github_url   TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Blog posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  slug             TEXT    NOT NULL UNIQUE,
  content          TEXT    NOT NULL DEFAULT '',  -- Markdown
  excerpt          TEXT,
  meta_description TEXT,
  og_image         TEXT,
  keywords         TEXT,
  author           TEXT    NOT NULL DEFAULT 'Your Name',
  status           TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  published_at     DATETIME,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Client inquiries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  ip_address TEXT,
  is_read    INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
