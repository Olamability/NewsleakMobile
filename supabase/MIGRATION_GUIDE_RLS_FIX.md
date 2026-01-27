# Migration Guide: Fix RLS Policies for news_articles

## Problem

The `news_articles` table has Row Level Security (RLS) enabled but is missing critical policies for INSERT, UPDATE, and DELETE operations. This causes:

1. **RSS Ingestion Failures**: Error `"new row violates row-level security policy for table \"news_articles\""`
   - Articles cannot be fetched and stored from RSS feeds
   - 0 articles stored despite successful RSS parsing

2. **Admin Cannot Delete Articles**: 
   - Manually added articles cannot be removed via Admin UI
   - Delete operations fail silently or with RLS errors

3. **Admin Cannot Update Articles**:
   - Cannot toggle `is_featured` status
   - Cannot edit article metadata

## Solution

Apply the migration to add missing RLS policies that allow authenticated users to perform INSERT, UPDATE, and DELETE operations on `news_articles`.

## How to Apply the Fix

### Option 1: Quick Fix (Recommended for existing databases)

1. **Open Supabase SQL Editor**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Click **SQL Editor** in the left sidebar

2. **Run the migration**
   - Copy the contents of `migration-fix-news-articles-rls.sql`
   - Paste into SQL Editor
   - Click **Run** or press `Ctrl+Enter`

3. **Verify the fix**
   - Run this query to check policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'news_articles';
   ```
   - You should see 4 policies:
     - `public_read_articles` (SELECT)
     - `authenticated_insert_articles` (INSERT)
     - `authenticated_update_articles` (UPDATE)
     - `authenticated_delete_articles` (DELETE)

### Option 2: Fresh Setup (For new deployments)

If setting up a new database, simply run the updated `schema.sql` file which now includes all necessary policies.

## Expected Results After Migration

### ✅ RSS Ingestion Will Work
```
WARN  Starting ingestion from 2 sources...
WARN  Fetching RSS feed from TechCrunch...
WARN  Processing 20 articles from TechCrunch...
WARN  ✓ Successfully ingested 18 articles from TechCrunch  // Previously: 0
```

### ✅ Admin Can Delete Articles
- Navigate to Admin Dashboard → Manage Articles
- Click "Remove" on any article
- Article will be successfully deleted

### ✅ Admin Can Update Articles
- Toggle "Featured" status on articles
- Updates will be saved successfully

## Security Considerations

**Q: Is it safe to allow all authenticated users to INSERT/UPDATE/DELETE articles?**

**A:** Yes, because:
1. The app already implements application-level admin checks using `is_admin` in user metadata
2. Only users who sign up through the app can authenticate
3. Admin features are only visible to users with `is_admin: true`
4. RSS ingestion runs in authenticated context
5. This follows the security pattern already used for `news_sources` table

The RLS policies provide database-level permission for operations, while the application code enforces who can actually perform admin actions.

## Troubleshooting

### Issue: Policies already exist
If you get an error like `policy "authenticated_insert_articles" already exists`:
- The migration was already applied
- No action needed
- Verify with the verification query above

### Issue: Still getting RLS errors after migration
1. Verify policies were created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'news_articles';
   ```

2. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'news_articles';
   ```
   (Should show `rowsecurity = true`)

3. Ensure user is authenticated:
   - Check that you're logged into the app
   - RSS ingestion should use service role or authenticated client

### Issue: Network errors for RSS feeds
Network errors like `[AxiosError: Network Error]` are unrelated to RLS and indicate:
- RSS feed URL is unreachable
- Network connectivity issues
- CORS or SSL certificate problems
- Remove or fix the problematic RSS source in Admin Dashboard

## Files Modified

- ✅ `supabase/migration-fix-news-articles-rls.sql` - Migration to apply to existing databases
- ✅ `supabase/schema.sql` - Updated schema for fresh deployments
- ✅ `supabase/MIGRATION_GUIDE_RLS_FIX.md` - This guide

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
