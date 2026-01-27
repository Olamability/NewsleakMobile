# Migration Setup - Summary

## What Was Fixed

This PR resolves the database setup issue where users encountered:

```
Error: Failed to run sql query: ERROR: 42P01: relation "news_articles" does not exist
```

## Root Cause

The repository had schema files but no structured migration system:

- Schema files existed in `/supabase/` directory
- No standardized way to apply migrations
- Users had to manually copy/paste SQL into Supabase dashboard
- No clear documentation on the correct order to apply migrations

## Solution Implemented

We've created a complete database migration system with multiple setup options.

### What's New

1. **Migrations Directory** (`/supabase/migrations/`)
   - 7 migration files in proper order
   - Timestamped filenames for sequential application
   - Each migration is idempotent (safe to run multiple times)

2. **Setup Helper Script** (`npm run setup:db`)
   - Interactive guide for applying migrations
   - Shows all migration files and correct order
   - Verifies sample data file exists before suggesting it

3. **Consolidated Init File** (`/supabase/init.sql`)
   - Single file containing all migrations
   - Perfect for fresh database setup
   - Easier alternative to running migrations individually

4. **Comprehensive Documentation** (`DATABASE_SETUP.md`)
   - Quick fix section at the top
   - Three different setup methods
   - Troubleshooting guide
   - Verification steps

## How Users Can Fix the Error

### Option 1: Quick Automated Setup (Recommended)

```bash
npm run setup:db
```

Follow the on-screen instructions.

### Option 2: One-File Setup

1. Open Supabase SQL Editor
2. Copy/paste entire `supabase/init.sql`
3. Click Run

### Option 3: Step-by-Step Migrations

Apply each file from `supabase/migrations/` in order:

1. `20240101000000_initial_schema.sql`
2. `20240102000000_add_missing_columns.sql`
3. `20240103000000_fix_foreign_keys_and_rls.sql`
4. `20240104000000_fix_news_articles_rls.sql`
5. `20240105000000_fix_news_sources_rls.sql`
6. `20240106000000_fix_schema_cache.sql`
7. `20240107000000_add_likes_comments.sql`

## What Gets Created

The migrations set up a complete database with:

### Tables (17 total)

- `categories` - News categories
- `news_sources` - RSS feed sources
- `news_articles` - Main articles table
- `article_likes` - User engagement
- `article_comments` - Comments system
- `sponsored_content` - Ads/sponsored posts
- `analytics_events` - Event tracking
- `user_devices` - Push notification tokens
- `publishers` - Publisher management
- `publisher_sources` - Publisher RSS feeds
- `admin_users` - Admin roles
- `article_moderation` - Content moderation
- `push_campaigns` - Push notification campaigns
- `recent_searches` - Search history
- `trending_topics` - Trending searches
- `ingestion_logs` - RSS fetch logs

### Security

- Row Level Security (RLS) policies on all tables
- Public read access where appropriate
- Authenticated user policies for writes
- Anonymous engagement support

### Performance

- 12+ indexes for fast queries
- Proper foreign key constraints
- Unique constraints for data integrity

### Seed Data

- 8 default categories
- 5 sample news sources (BBC, CNN, The Guardian, etc.)
- 4 trending topics

## Files Changed

### New Files

- `supabase/migrations/` - Directory with 7 migration files
- `supabase/migrations/README.md` - Migration documentation
- `supabase/init.sql` - Consolidated migration
- `DATABASE_SETUP.md` - Setup guide
- `scripts/setup-database.js` - Setup helper
- `MIGRATION_SUMMARY.md` - This file

### Modified Files

- `package.json` - Added `setup:db` script
- `README.md` - Added database setup link

## Verification

After setup, verify in Supabase Table Editor:

- All 17 tables exist
- `categories` has 8 rows
- `news_sources` has 5 rows
- `trending_topics` has 4 rows

## Backward Compatibility

- Legacy schema files remain in place
- Existing setups won't be affected
- Can still use old manual approach if needed

## Next Steps for Users

1. Run one of the setup methods above
2. Verify tables were created
3. (Optional) Run `supabase/sample-articles.sql` for test data
4. Start the app: `npm start`
5. The error should be resolved!

## Need Help?

See:

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed setup guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- Repository issues - Report problems

## Technical Notes

### Migration Order Matters

Migrations must be applied in timestamp order because:

- Later migrations depend on tables from earlier ones
- Foreign keys require referenced tables to exist
- RLS policies need tables to be created first

### Idempotency

All migrations use `IF NOT EXISTS` or similar checks:

- Safe to run multiple times
- Won't fail if tables already exist
- Won't duplicate seed data

### Schema Cache

The `NOTIFY pgrst, 'reload schema'` command:

- Tells PostgREST to reload schema
- Optional - may not work on all instances
- Can be safely ignored if it fails
