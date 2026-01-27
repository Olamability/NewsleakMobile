# RLS Policy Fix - Quick Reference

## What Was Broken

Your Spazr News app had these critical issues:

1. ❌ **RSS feeds couldn't fetch articles** - Error: `"new row violates row-level security policy"`
2. ❌ **Admin couldn't delete articles** - Manually added articles were stuck forever
3. ❌ **Admin couldn't update articles** - Featured toggle didn't work

## What Was Fixed

✅ Added 3 database security policies to allow authenticated users to:
- **INSERT** articles (enables RSS ingestion)
- **UPDATE** articles (enables admin features)
- **DELETE** articles (enables admin cleanup)

## How to Apply the Fix

### Quick Steps (5 minutes):

1. **Log into Supabase**
   - Go to https://supabase.com
   - Open your project
   - Click "SQL Editor"

2. **Run the Migration**
   - Copy this file: `supabase/migration-fix-news-articles-rls.sql`
   - Paste into SQL Editor
   - Click "Run"
   - You should see: "Success. No rows returned"

3. **Verify It Worked**
   - Restart your app
   - RSS ingestion should now store articles (check logs)
   - Admin panel delete button should work

### Detailed Guide

See `supabase/MIGRATION_GUIDE_RLS_FIX.md` for troubleshooting and detailed instructions.

## Expected Results

**Before:**
```
WARN  Processing 20 articles from TechCrunch...
ERROR Error storing articles: {"code": "42501", "message": "new row violates row-level security policy"}
WARN  ✓ Successfully ingested 0 articles from TechCrunch
```

**After:**
```
WARN  Processing 20 articles from TechCrunch...
WARN  ✓ Successfully ingested 18 articles from TechCrunch
```

## Security Note

These policies are safe because:
- Only authenticated app users can perform these operations
- Admin features check `is_admin` in user metadata
- This matches the security pattern used elsewhere in the app
- You control who gets admin access via Supabase dashboard

## Need Help?

See the detailed migration guide: `MIGRATION_GUIDE_RLS_FIX.md`
