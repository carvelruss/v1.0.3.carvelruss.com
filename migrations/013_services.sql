-- Services table for /services/[slug] landing pages
CREATE TABLE IF NOT EXISTS services (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  slug            TEXT    NOT NULL UNIQUE,
  description     TEXT    NOT NULL DEFAULT '',
  excerpt         TEXT,
  content         TEXT    NOT NULL DEFAULT '',
  icon_url        TEXT,
  cover_url       TEXT,
  features        TEXT    NOT NULL DEFAULT '[]',
  tags            TEXT    NOT NULL DEFAULT '[]',
  cta_label       TEXT,
  cta_url         TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  seo_title       TEXT,
  seo_description TEXT,
  published_at    DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_slug   ON services(slug);
