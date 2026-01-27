-- Migration: Fix Missing RLS Policies for news_articles Table
--
-- Issue: The news_articles table has RLS enabled but only has a SELECT policy.
-- This blocks:
--   1. RSS ingestion from inserting new articles
--   2. Admin users from deleting manually added articles
--   3. Admin users from updating article features (is_featured, etc.)
--
-- Solution: Add INSERT, UPDATE, and DELETE policies for authenticated users.
-- The application-level admin checks (is_admin metadata) provide the actual
-- authorization control, while these RLS policies allow database operations.
--
-- Date: 2026-01-27
-- Severity: Critical - Breaks core app functionality

-- Allow authenticated users to insert articles
-- This enables:
--   - Automated RSS feed ingestion
--   - Manual article additions via admin panel
--   - Article duplication/archiving features
CREATE POLICY "authenticated_insert_articles" 
ON news_articles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update articles
-- This enables:
--   - Admin toggling of is_featured status
--   - Admin editing of article metadata
--   - View count increments
--   - Article moderation actions
CREATE POLICY "authenticated_update_articles" 
ON news_articles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete articles
-- This enables:
--   - Admin deletion of manually added articles
--   - Admin removal of inappropriate/spam content
--   - Admin cleanup of duplicate articles
--   - Article archival/moderation
CREATE POLICY "authenticated_delete_articles" 
ON news_articles 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Verification queries (run these to confirm policies are active):
-- SELECT * FROM pg_policies WHERE tablename = 'news_articles';
