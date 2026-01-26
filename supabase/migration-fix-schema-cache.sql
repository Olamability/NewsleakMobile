-- Migration: Fix schema cache issues
-- This migration ensures all required tables and columns exist
-- Addresses errors:
-- 1. "Could not find the table 'public.ingestion_logs' in the schema cache"
-- 2. "Could not find the 'article_url' column of 'news_articles' in the schema cache"
--
-- NOTE: This migration can be run safely even if schema.sql has already been applied.
-- It uses IF NOT EXISTS clauses to only create missing elements.
-- This is a consolidated fix for users who may have partial schema from older versions.

-- =============================================
-- ENSURE INGESTION_LOGS TABLE EXISTS
-- =============================================
-- Creates the table exactly as defined in schema.sql (lines 186-198)
-- This is needed if users have an old schema that predates ingestion_logs
CREATE TABLE IF NOT EXISTS ingestion_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id uuid REFERENCES news_sources(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  status text NOT NULL, -- in_progress | success | error
  articles_fetched integer DEFAULT 0,
  articles_processed integer DEFAULT 0,
  articles_duplicates integer DEFAULT 0,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- ENSURE ALL REQUIRED COLUMNS IN NEWS_ARTICLES
-- =============================================
-- Add missing columns to news_articles table if they don't exist
-- These columns are defined in schema.sql but may be missing in older databases
-- This section ensures compatibility with migration-add-missing-columns.sql
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
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_breaking boolean DEFAULT false;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS quality_score numeric DEFAULT 1.0;

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
-- These indexes are defined in schema.sql (lines 203-212)
-- Using IF NOT EXISTS ensures they're created if missing without causing errors
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category_id ON news_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_id ON news_articles(source_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_breaking ON news_articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX IF NOT EXISTS idx_news_articles_content_hash ON news_articles(content_hash);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_created_at ON ingestion_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_source_id ON ingestion_logs(source_id);

-- =============================================
-- ADD UNIQUE CONSTRAINTS
-- =============================================
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

-- =============================================
-- ENABLE ROW LEVEL SECURITY ON INGESTION_LOGS
-- =============================================
ALTER TABLE ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "public_read_ingestion_logs" ON ingestion_logs;
DROP POLICY IF EXISTS "service_insert_ingestion_logs" ON ingestion_logs;
DROP POLICY IF EXISTS "service_update_ingestion_logs" ON ingestion_logs;

-- Create RLS policies for ingestion_logs
CREATE POLICY "public_read_ingestion_logs" ON ingestion_logs FOR SELECT USING (true);
CREATE POLICY "service_insert_ingestion_logs" ON ingestion_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "service_update_ingestion_logs" ON ingestion_logs FOR UPDATE USING (true);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$ 
BEGIN 
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE '✓ ingestion_logs table created/verified';
    RAISE NOTICE '✓ news_articles columns added/verified';
    RAISE NOTICE '✓ Indexes created';
    RAISE NOTICE '✓ RLS policies configured';
END $$;
