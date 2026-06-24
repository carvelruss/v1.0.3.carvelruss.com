-- Add device_type column to page_views for device breakdown analytics
ALTER TABLE page_views ADD COLUMN device_type TEXT DEFAULT 'desktop';
CREATE INDEX IF NOT EXISTS idx_pv_device ON page_views (device_type);
