-- Migration 005: Add extended fields to posts table

ALTER TABLE posts ADD COLUMN category TEXT;
ALTER TABLE posts ADD COLUMN featured_image_caption TEXT;
ALTER TABLE posts ADD COLUMN reading_time TEXT;
ALTER TABLE posts ADD COLUMN views_count INTEGER;
