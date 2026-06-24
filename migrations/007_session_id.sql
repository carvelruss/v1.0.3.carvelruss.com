-- Add session_id to page_views for session-based analytics
ALTER TABLE page_views ADD COLUMN session_id TEXT;
CREATE INDEX IF NOT EXISTS idx_pv_session ON page_views (session_id);
