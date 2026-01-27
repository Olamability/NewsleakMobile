-- Migration: Add missing columns to news_articles table
-- This migration adds columns that were missing from the initial schema
-- Run this if you already have a database created with the old schema

-- Add missing columns to news_articles table
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content_snippet text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS article_url text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS content_hash text;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add unique constraint on content_hash if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'news_articles_content_hash_key'
    ) THEN
        ALTER TABLE news_articles ADD CONSTRAINT news_articles_content_hash_key UNIQUE (content_hash);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_content_hash ON news_articles(content_hash);

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Migration completed successfully! Missing columns have been added to news_articles table.';
END $$;
