-- Migration: Fix Foreign Key Constraints and RLS Policies
--
-- Issues Fixed:
-- 1. analytics_events.article_id foreign key missing ON DELETE CASCADE
--    This prevents admin from deleting articles with analytics events
-- 2. RLS policy for news_articles insert requires authentication
--    This prevents RSS ingestion (which runs without user session) from working
--
-- Date: 2026-01-27
-- Severity: Critical - Breaks admin deletion and RSS ingestion

-- =====================================================
-- FIX 1: Update analytics_events foreign key constraint
-- =====================================================

-- First, drop the existing foreign key constraint
ALTER TABLE analytics_events 
DROP CONSTRAINT IF EXISTS analytics_events_article_id_fkey;

-- Re-add the foreign key with ON DELETE CASCADE
-- This ensures analytics events are automatically deleted when an article is deleted
ALTER TABLE analytics_events 
ADD CONSTRAINT analytics_events_article_id_fkey 
FOREIGN KEY (article_id) 
REFERENCES news_articles(id) 
ON DELETE CASCADE;

-- =====================================================
-- FIX 2: Update RLS policies for news_articles
-- =====================================================

-- Drop the existing INSERT policy that requires authentication
DROP POLICY IF EXISTS "authenticated_insert_articles" ON news_articles;

-- Create a new policy that allows both authenticated and service inserts
-- This allows:
--   1. RSS ingestion to work (runs without user session)
--   2. Authenticated admin users to manually add articles
CREATE POLICY "allow_insert_articles" 
ON news_articles 
FOR INSERT 
WITH CHECK (true);

-- Note: We keep UPDATE and DELETE policies requiring authentication
-- as those are admin-only operations that require a logged-in user

-- =====================================================
-- Verification queries (run these to confirm changes):
-- =====================================================
-- Check foreign key constraint:
-- SELECT 
--   tc.constraint_name, 
--   tc.table_name, 
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name,
--   rc.delete_rule
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--   ON rc.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_name = 'analytics_events'
--   AND kcu.column_name = 'article_id';
--
-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename = 'news_articles';
