# Database Setup Guide

## 🚨 Quick Fix for "relation does not exist" Error

If you're seeing this error:
```
Error: Failed to run sql query: ERROR: 42P01: relation "news_articles" does not exist
```

**QUICK SOLUTION:**

1. Run this command in your project:
   ```bash
   npm run setup:db
   ```

2. Follow the on-screen instructions to apply migrations in your Supabase dashboard

3. Your database will be set up and the error will be fixed!

**Need more details?** Continue reading below.

---

This guide will help you set up the database for the NewsleakMobile app using Supabase.

## Problem

If you're seeing this error:
```
Error: Failed to run sql query: ERROR: 42P01: relation "news_articles" does not exist
```

It means your database schema hasn't been set up yet. Follow this guide to fix it.

## Prerequisites

1. A Supabase account (free tier works fine)
2. A Supabase project created

## Option 1: Automated Setup (Recommended)

We've created migration files that you can apply in order. You have two ways to do this:

### Using the Setup Script

Run the setup script from your project root:

```bash
npm run setup:db
```

This will guide you through applying all necessary migrations.

### One-File Quick Setup (Alternative)

If you prefer to apply everything at once:

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the **SQL Editor** (left sidebar)
4. Copy and paste the entire content of `supabase/init.sql`
5. Click **Run**
6. Done! All tables, indexes, and seed data will be created.

### Manual Migration Application

If you prefer to do it manually, follow these steps:

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the **SQL Editor** (left sidebar)
4. Apply each migration file in order by copying and pasting the content:

   **Important: Run these in the exact order listed below!**

   1. `supabase/migrations/20240101000000_initial_schema.sql` - Creates all base tables
   2. `supabase/migrations/20240102000000_add_missing_columns.sql` - Adds missing columns
   3. `supabase/migrations/20240103000000_fix_foreign_keys_and_rls.sql` - Fixes foreign keys and RLS
   4. `supabase/migrations/20240104000000_fix_news_articles_rls.sql` - Fixes news articles RLS
   5. `supabase/migrations/20240105000000_fix_news_sources_rls.sql` - Fixes news sources RLS
   6. `supabase/migrations/20240106000000_fix_schema_cache.sql` - Fixes schema cache
   7. `supabase/migrations/20240107000000_add_likes_comments.sql` - Adds engagement features

5. After running all migrations, optionally add sample data:
   - Run `supabase/sample-articles.sql` to populate with test articles

## Option 2: Legacy Manual Setup (Fallback)

If the migrations don't work for some reason, you can use the legacy approach:

1. Go to Supabase SQL Editor
2. Copy and paste the entire content of `supabase/schema.sql`
3. Click **Run**
4. If any errors occur, check if the tables already exist
5. Optionally run `supabase/sample-articles.sql` for test data

## Verification

After setup, verify the database is working:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `categories`
   - `news_sources`
   - `news_articles`
   - `sponsored_content`
   - `analytics_events`
   - `user_devices`
   - `publishers`
   - `publisher_sources`
   - `admin_users`
   - `article_moderation`
   - `push_campaigns`
   - `recent_searches`
   - `trending_topics`
   - `ingestion_logs`
   - `article_likes`
   - `article_comments`

3. Check that `categories` and `news_sources` have sample data
4. If you ran `sample-articles.sql`, `news_articles` should have ~20 articles

## Troubleshooting

### "relation already exists" errors

This means the table was already created. You can either:
- Skip that migration and continue with the next one
- Or drop the existing tables and start fresh (⚠️ this will delete all data)

### "permission denied" errors

Make sure you're using the correct Supabase credentials and that your API keys have the right permissions.

### Still seeing "relation does not exist" after setup

1. Make sure you ran ALL migration files in order
2. Check the Supabase logs for any errors during migration
3. Try refreshing your schema cache:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### Tables exist but app still shows errors

1. Check your `.env` file has the correct Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
2. Restart your development server: `npm start`
3. Clear the app cache if using Expo Go

## What Gets Created

The migrations create:

- **Core tables**: Categories, sources, articles, users
- **Engagement**: Likes and comments system
- **Admin features**: Article moderation, campaigns
- **Analytics**: Event tracking, trending topics
- **Security**: RLS policies for all tables
- **Performance**: Indexes for fast queries
- **Sample data**: Default categories and sources

## Need Help?

If you're still having issues after following this guide:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review the [Supabase documentation](https://supabase.com/docs)
3. Open an issue on GitHub with:
   - The exact error message
   - Which migration step failed
   - Your Supabase project tier (free/pro)
   - Relevant logs or screenshots
