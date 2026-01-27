# Applying Database Migrations

This guide explains how to apply the database migrations to fix critical issues in the NewsleakMobile app.

## Issues Fixed

The migration file `migration-fix-foreign-keys-and-rls.sql` fixes the following issues:

1. **Admin cannot delete news articles** - Articles with analytics events couldn't be deleted due to foreign key constraint
2. **RSS ingestion fails with RLS policy violation** - The automated RSS ingestion runs without user authentication but RLS policy required auth.uid()

## Prerequisites

- Access to your Supabase dashboard
- Database admin privileges

## Method 1: Using Supabase Dashboard (Recommended)

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `migration-fix-foreign-keys-and-rls.sql`
6. Paste into the SQL editor
7. Click **Run** to execute the migration
8. Verify the changes:
   ```sql
   -- Check foreign key constraint has CASCADE
   SELECT 
     tc.constraint_name, 
     tc.table_name, 
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     rc.delete_rule
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   JOIN information_schema.referential_constraints AS rc
     ON rc.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
     AND tc.table_name = 'analytics_events'
     AND kcu.column_name = 'article_id';
   
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'news_articles';
   ```

## Method 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Run the migration
supabase db push migration-fix-foreign-keys-and-rls.sql
```

## Method 3: Using psql

If you have direct database access:

```bash
psql <your-database-connection-string> -f supabase/migration-fix-foreign-keys-and-rls.sql
```

## What Changed

### 1. Analytics Events Foreign Key

**Before:**
```sql
article_id uuid references news_articles(id)
```

**After:**
```sql
article_id uuid references news_articles(id) ON DELETE CASCADE
```

**Impact:** When an article is deleted, all associated analytics events are automatically deleted as well.

### 2. News Articles Insert Policy

**Before:**
```sql
CREATE POLICY "authenticated_insert_articles" 
ON news_articles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);
```

**After:**
```sql
CREATE POLICY "allow_insert_articles" 
ON news_articles 
FOR INSERT 
WITH CHECK (true);
```

**Impact:** RSS ingestion (which runs without user authentication) can now insert articles into the database.

## Verification Steps

After applying the migration, verify that:

1. **Admin can delete articles:**
   - Log in as admin
   - Navigate to Admin Dashboard → Manage Articles
   - Try deleting an article that has analytics events
   - Should succeed without foreign key constraint error

2. **RSS ingestion works:**
   - Wait for the next scheduled ingestion (every 15 minutes)
   - Or trigger manual ingestion from Admin Dashboard
   - Check Ingestion Logs - should show successful article insertion
   - No "new row violates row-level security policy" errors

3. **Admin can delete news sources:**
   - Navigate to Admin Dashboard → Manage Sources
   - Click the delete button (🗑️) on any source
   - Should delete the source and all its articles

## Rollback (If Needed)

If you need to rollback these changes:

```sql
-- Rollback foreign key constraint
ALTER TABLE analytics_events 
DROP CONSTRAINT analytics_events_article_id_fkey;

ALTER TABLE analytics_events 
ADD CONSTRAINT analytics_events_article_id_fkey 
FOREIGN KEY (article_id) 
REFERENCES news_articles(id);

-- Rollback RLS policy
DROP POLICY IF EXISTS "allow_insert_articles" ON news_articles;

CREATE POLICY "authenticated_insert_articles" 
ON news_articles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);
```

⚠️ **Warning:** Rollback will re-introduce the original bugs.

## Troubleshooting

### Error: "policy already exists"

This means the migration was already applied. You can safely ignore this error.

### Error: "permission denied"

Make sure you're running the migration with database admin privileges (service role key in Supabase).

### RSS ingestion still fails

1. Check that the RLS policy was updated:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'news_articles' AND policyname = 'allow_insert_articles';
   ```
2. Verify the policy has `WITH CHECK (true)` not `WITH CHECK (auth.uid() IS NOT NULL)`

## Support

If you encounter issues applying this migration, please:

1. Check the Supabase logs for detailed error messages
2. Verify your database permissions
3. Contact the development team with error details
