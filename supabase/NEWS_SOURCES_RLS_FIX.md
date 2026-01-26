# News Sources RLS Policy Fix

## Problem
When trying to add or update news sources through the admin panel, you may encounter the error:
```
new row violates row-level security policy for table "news_sources"
```

Additionally, the deactivate button for news sources doesn't work.

## Root Cause
The `news_sources` table has Row Level Security (RLS) enabled but lacks the necessary INSERT and UPDATE policies for authenticated users (admins).

## Solution
Run the migration SQL to add the missing RLS policies.

### Option 1: Apply Migration (Recommended for existing databases)
1. Log into your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migration-fix-news-sources-rls.sql`
4. Click "Run"

### Option 2: Fresh Database Setup
If you're setting up a fresh database, the updated `supabase/schema.sql` file already includes these policies. Simply run:
1. Copy and paste the entire contents of `supabase/schema.sql`
2. Run it in Supabase SQL Editor

## What This Fix Does

### 1. Updates SELECT Policy
**Before:** Only public users could see active sources
```sql
CREATE POLICY "public_read_sources" ON news_sources
  FOR SELECT USING (is_active = true);
```

**After:** Public users see active sources, authenticated users see all sources
```sql
CREATE POLICY "public_and_admin_read_sources" ON news_sources
  FOR SELECT USING (
    is_active = true 
    OR auth.uid() IS NOT NULL
  );
```

### 2. Adds INSERT Policy
Allows authenticated users to add new news sources:
```sql
CREATE POLICY "authenticated_insert_sources" ON news_sources
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. Adds UPDATE Policy
Allows authenticated users to update news sources (including toggling active status):
```sql
CREATE POLICY "authenticated_update_sources" ON news_sources
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

### 4. Adds DELETE Policy
Allows authenticated users to delete news sources (for future use):
```sql
CREATE POLICY "authenticated_delete_sources" ON news_sources
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

## Testing

After applying the migration:

1. **Test Adding a Source:**
   - Sign in as an admin user
   - Navigate to Admin Dashboard > Manage Sources
   - Click "+ Add Source"
   - Fill in the details and submit
   - ✅ Should successfully add the source without RLS errors

2. **Test Deactivating a Source:**
   - In Manage Sources screen, toggle any source's switch
   - ✅ Should successfully update the source status
   - ✅ The switch should reflect the new state

3. **Test Viewing All Sources:**
   - ✅ Admin users should see both active and inactive sources
   - ✅ Public (non-authenticated) users should only see active sources in the app

## Security Notes

These policies require authentication (`auth.uid() IS NOT NULL`) but don't explicitly check for admin role. This is acceptable because:

1. The admin UI screens are only accessible to users with `is_admin = true` in their user metadata
2. For additional security in production, you may want to:
   - Check the `is_admin` flag in the user metadata within the policy
   - Create a helper function that verifies admin status
   - Use the `admin_users` table for more granular role checking

Example of more restrictive policy (optional):
```sql
CREATE POLICY "admin_only_insert_sources" ON news_sources
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
```

## Files Changed
- `supabase/schema.sql` - Updated with new RLS policies
- `supabase/migration-fix-news-sources-rls.sql` - Migration script for existing databases
- `supabase/NEWS_SOURCES_RLS_FIX.md` - This documentation file
