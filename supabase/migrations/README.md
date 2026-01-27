# Database Migrations

This directory contains all database migrations for the NewsleakMobile app.

## How to Apply Migrations

### Option 1: Automated Setup (Recommended)

Run the setup script from the project root:

```bash
npm run setup:db
```

### Option 2: Manual Application

Apply each migration file in order using the Supabase SQL Editor:

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Apply migrations in order (filenames are prefixed with timestamps)

## Migration Files

| File | Description |
|------|-------------|
| `20240101000000_initial_schema.sql` | Creates all base tables, indexes, and RLS policies |
| `20240102000000_add_missing_columns.sql` | Adds missing columns to news_articles table |
| `20240103000000_fix_foreign_keys_and_rls.sql` | Fixes foreign key constraints and RLS policies |
| `20240104000000_fix_news_articles_rls.sql` | Fixes news_articles RLS policies |
| `20240105000000_fix_news_sources_rls.sql` | Fixes news_sources RLS policies |
| `20240106000000_fix_schema_cache.sql` | Fixes schema cache issues |
| `20240107000000_add_likes_comments.sql` | Adds likes and comments functionality |

## Important Notes

- **Always apply migrations in order** (sorted by filename)
- Each migration is idempotent - safe to run multiple times
- If a migration fails, check if the changes already exist
- See [DATABASE_SETUP.md](../../DATABASE_SETUP.md) for troubleshooting

## Creating New Migrations

When adding a new migration:

1. Create a new file with format: `YYYYMMDDHHMMSS_description.sql`
2. Use the current date/time for the timestamp
3. Make migrations idempotent using `IF NOT EXISTS` or similar
4. Test the migration on a dev database first
5. Update this README with the new migration

## Legacy Files

The parent `supabase/` directory contains legacy migration files for backwards compatibility:
- `schema.sql` - Original schema file
- `migration-*.sql` - Individual migration files

These have been consolidated into the `migrations/` directory.
