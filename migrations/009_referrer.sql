-- Add referrer hostname to page_views for traffic source analytics
ALTER TABLE page_views ADD COLUMN referrer TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_pv_referrer ON page_views (referrer);
