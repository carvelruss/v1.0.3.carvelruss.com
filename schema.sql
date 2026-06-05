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

-- ── Seed: initial projects ────────────────────────────────────────────────────
INSERT OR IGNORE INTO projects (id, title, description, tech, role, live_url, case_study_url, github_url, sort_order) VALUES
  (1, 'HealthTrack Dashboard',
   'A responsive health monitoring dashboard designed for patients and clinicians. Focused on data clarity, accessibility, and an intuitive navigation structure that reduced task completion time by 40%.',
   '["React","TypeScript","SCSS","Figma"]', 'Lead UI/UX Designer & Frontend Developer', '#', '#', '#', 1),
  (2, 'ShopFlow E-Commerce Redesign',
   'End-to-end redesign of an e-commerce platform. Conducted user interviews, built prototypes in Figma, and implemented the design in React. Improved checkout conversion rate by 28%.',
   '["React","Bootstrap","Figma","Adobe XD"]', 'UX Researcher & Frontend Developer', '#', '#', '#', 2),
  (3, 'Onboard — SaaS Onboarding Kit',
   'A reusable onboarding component library for SaaS products. Designed a design-system-first approach with tokens, component documentation, and developer handoff guides.',
   '["React","TypeScript","Storybook","Figma"]', 'Design Systems Lead', '#', '#', '#', 3),
  (4, 'CityGuide Mobile App',
   'A cross-platform travel companion app featuring interactive maps, local event feeds, and personalised recommendations. Designed end-to-end from user flows to high-fidelity prototypes.',
   '["Figma","Prototyping","React Native","TypeScript"]', 'UI/UX Designer', '#', '#', '#', 4);
