-- Track which page and traffic source each inquiry came from
ALTER TABLE inquiries ADD COLUMN source_page TEXT DEFAULT NULL;
ALTER TABLE inquiries ADD COLUMN referrer    TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_inq_source ON inquiries (source_page);
