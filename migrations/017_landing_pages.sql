-- Landing pages: full-page templates with per-section JSON config
CREATE TABLE IF NOT EXISTS landing_pages (
  id              INTEGER  PRIMARY KEY AUTOINCREMENT,
  title           TEXT     NOT NULL,
  slug            TEXT     NOT NULL UNIQUE,
  status          TEXT     NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
  sections        TEXT     NOT NULL DEFAULT '{}',
  seo_title       TEXT,
  seo_description TEXT,
  og_image        TEXT,
  published_at    DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
