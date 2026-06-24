-- Add browser column for browser breakdown analytics
ALTER TABLE page_views ADD COLUMN browser TEXT DEFAULT 'Other';
CREATE INDEX IF NOT EXISTS idx_pv_browser ON page_views (browser);
