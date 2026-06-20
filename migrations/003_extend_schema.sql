-- Migration 003: Extend schema for enhanced portfolio features

-- ── Extend projects table ────────────────────────────────────────────────────
ALTER TABLE projects ADD COLUMN excerpt TEXT;
ALTER TABLE projects ADD COLUMN project_type TEXT;
ALTER TABLE projects ADD COLUMN client_name TEXT;
ALTER TABLE projects ADD COLUMN tools TEXT;
ALTER TABLE projects ADD COLUMN timeline TEXT;
ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE projects ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN seo_title TEXT;
ALTER TABLE projects ADD COLUMN seo_description TEXT;
ALTER TABLE projects ADD COLUMN published_at TEXT;

-- ── Extend inquiries table ───────────────────────────────────────────────────
ALTER TABLE inquiries ADD COLUMN subject TEXT;
ALTER TABLE inquiries ADD COLUMN project_type TEXT;
ALTER TABLE inquiries ADD COLUMN budget_range TEXT;
ALTER TABLE inquiries ADD COLUMN timeline TEXT;
ALTER TABLE inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'unread';
ALTER TABLE inquiries ADD COLUMN updated_at DATETIME;

-- ── Media assets table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_assets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name  TEXT    NOT NULL,
  file_url   TEXT    NOT NULL,
  file_type  TEXT,
  file_size  INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Site settings table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key   TEXT    NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Default site settings ────────────────────────────────────────────────────
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES
  ('site_name',       'Carvel Russ'),
  ('site_tagline',    'UI/UX Developer'),
  ('contact_email',   'hello@carvelruss.com'),
  ('linkedin_url',    ''),
  ('github_url',      ''),
  ('twitter_url',     ''),
  ('availability',    'Available for new projects'),
  ('hero_headline',   'UI/UX Developer crafting clean, conversion-focused digital experiences.');

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects (featured);
CREATE INDEX IF NOT EXISTS idx_inquiries_status  ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries (created_at);
CREATE INDEX IF NOT EXISTS idx_media_created     ON media_assets (created_at);
