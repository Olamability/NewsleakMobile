-- Migration: Fix news_sources RLS policies
-- This migration adds missing INSERT and UPDATE policies for news_sources table
-- and updates the SELECT policy to allow admins to view all sources

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "public_read_sources" ON news_sources;

-- Add SELECT policy that allows:
-- 1. Public users to view active sources
-- 2. Authenticated users to view all sources (for admin panel)
CREATE POLICY "public_and_admin_read_sources" ON news_sources
  FOR SELECT
  USING (
    is_active = true 
    OR auth.uid() IS NOT NULL
  );

-- Add INSERT policy for authenticated users (admins)
CREATE POLICY "authenticated_insert_sources" ON news_sources
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add UPDATE policy for authenticated users (admins)
CREATE POLICY "authenticated_update_sources" ON news_sources
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add DELETE policy for authenticated users (admins) - for future use
CREATE POLICY "authenticated_delete_sources" ON news_sources
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
