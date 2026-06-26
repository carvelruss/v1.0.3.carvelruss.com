-- Testimonials submitted by clients via the public "Write a Review" form.
-- Admin must approve before they appear on the homepage.
CREATE TABLE IF NOT EXISTS testimonials (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  full_name    TEXT     NOT NULL,
  company_name TEXT     NOT NULL,
  website_url  TEXT     NOT NULL,
  message      TEXT     NOT NULL,
  status       TEXT     NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending','approved','rejected')),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
