# Fix Schema Cache and RSS Feed Errors

This guide helps you resolve common database schema and RSS feed errors in the NewsLeak Mobile app.

## Errors This Fixes

1. ❌ `Could not find the table 'public.ingestion_logs' in the schema cache`
2. ❌ `Could not find the 'article_url' column of 'news_articles' in the schema cache`
3. ❌ `Request failed with status code 404` for RSS feeds

## Quick Fix Steps

### Step 1: Apply Database Migration

The schema cache errors occur when your Supabase database is missing required tables or columns.

**To fix this:**

1. Open your Supabase project dashboard at [supabase.com](https://supabase.com)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migration-fix-schema-cache.sql`
5. Click **Run** to execute the migration
6. Verify you see success messages:
   ```
   ✓ ingestion_logs table created/verified
   ✓ news_articles columns added/verified
   ✓ Indexes created
   ✓ RLS policies configured
   ```

**Alternative: Use Supabase CLI**

```bash
# From your project root
supabase db push --file supabase/migration-fix-schema-cache.sql
```

### Step 2: Fix Invalid RSS Feed URLs

The 404 errors occur when RSS feed URLs are incorrect or the website has changed.

**Common Invalid Feed Patterns:**
- ❌ `https://example.com/feeds` (plural, often incorrect)
- ✅ `https://example.com/feed` (singular, usually correct)
- ✅ `https://example.com/feed/` (with trailing slash)
- ✅ `https://example.com/rss`
- ✅ `https://example.com/feed.xml`

**To fix feed URLs in your database:**

1. Open Supabase **SQL Editor**
2. Find the problematic source:
   ```sql
   -- Find sources with feed URLs ending in /feeds (common mistake)
   SELECT id, name, rss_url, is_active 
   FROM news_sources 
   WHERE rss_url LIKE '%/feeds';
   
   -- Or search for a specific source by name
   SELECT id, name, rss_url, is_active 
   FROM news_sources 
   WHERE name ILIKE '%your-source-name%';
   ```

3. **Option A: Update the feed URL** (if you know the correct URL)
   ```sql
   -- Example: Fix a feed URL from /feeds to /feed
   UPDATE news_sources 
   SET rss_url = 'https://example.com/feed/'  -- or /feed or /rss
   WHERE name = 'YourSourceName';
   ```

4. **Option B: Deactivate the source** (if feed doesn't exist)
   ```sql
   UPDATE news_sources 
   SET is_active = false 
   WHERE name = 'YourSourceName';
   ```

5. **Option C: Remove the source completely**
   ```sql
   DELETE FROM news_sources 
   WHERE name = 'YourSourceName';
   ```

### Step 3: Test RSS Feed URLs

Before adding a feed to your database, test if it's valid:

**Method 1: Browser Test**
1. Open the RSS feed URL in your browser
2. You should see XML content starting with `<?xml` or `<rss>`
3. If you see a 404 error page, the URL is invalid

**Method 2: Using curl**
```bash
curl -I https://example.com/feed
# Should return HTTP 200 OK
```

**Method 3: RSS Validator**
- Visit [W3C Feed Validator](https://validator.w3.org/feed/)
- Enter the feed URL
- Check if it validates successfully

## Common RSS Feed URL Patterns

Different platforms use different RSS feed URL patterns:

### WordPress Sites
```
https://example.com/feed/
https://example.com/feed
https://example.com/?feed=rss2
https://example.com/category/news/feed/
```

### Custom Domains
```
https://example.com/rss
https://example.com/rss.xml
https://example.com/feed.xml
https://example.com/blog/feed
```

### Subdomains
```
https://blog.example.com/feed/
https://news.example.com/rss
```

## Finding the Correct RSS Feed URL

If a feed URL is returning 404:

1. **Visit the website homepage**
2. **Look for RSS icon** (usually in header/footer)
3. **Check common locations:**
   - `/feed`
   - `/feed/`
   - `/rss`
   - `/rss.xml`
   - `/blog/feed`
4. **View page source** and search for "rss" or "feed"
5. **Use browser extensions** like "RSS Feed Reader" to auto-detect feeds

## Verifying the Fix

After applying the migration and fixing feed URLs:

### 1. Verify Database Schema

Run this SQL query in Supabase SQL Editor to verify the schema is correct:

```sql
-- Verify ingestion_logs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'ingestion_logs'
) as ingestion_logs_exists;

-- Verify article_url column exists
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'news_articles' 
  AND column_name = 'article_url'
) as article_url_exists;

-- Both should return 'true'
```

**Expected Output:**
```
ingestion_logs_exists: true
article_url_exists: true
```

If either returns `false`, re-run the migration script.

### 2. Test RSS Feed Ingestion

1. **Restart your app** to clear any cached errors
2. **Check the logs** for successful ingestion:
   ```
   ✓ Successfully ingested X articles from [Source]
   ```
3. **Verify in Admin Panel:**
   - Navigate to Admin Panel → Ingestion Logs
   - Check recent logs show "success" status
   - Verify articles appear in the app

### 3. Verify Active RSS Sources

Check which sources are active and their feed URLs:

```sql
SELECT 
  name,
  rss_url,
  is_active,
  (
    SELECT COUNT(*) 
    FROM ingestion_logs il 
    WHERE il.source_id = ns.id 
    AND il.status = 'success'
  ) as successful_ingestions,
  (
    SELECT COUNT(*) 
    FROM ingestion_logs il 
    WHERE il.source_id = ns.id 
    AND il.status = 'error'
  ) as failed_ingestions
FROM news_sources ns
WHERE is_active = true
ORDER BY name;
```

This shows you which sources are working and which are failing.

## Still Having Issues?

### Check Supabase Logs
1. Go to Supabase Dashboard → Logs
2. Look for recent errors
3. Check if RLS policies are blocking requests

### Verify Environment Variables
Make sure your `.env` file has correct Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Check Network Access
Some RSS feeds may be blocked by:
- Firewalls
- CORS policies
- Rate limiting
- Geo-restrictions

### Enable Debug Logging
To see detailed RSS parsing logs:
1. Check console/terminal output when app runs
2. Look for `WARN` and `ERROR` messages
3. Note which specific feed URLs are failing

## Preventing Future Issues

### Best Practices for Adding RSS Feeds

1. **Always test feed URLs first** before adding to database
2. **Use the canonical URL** (without www if possible)
3. **Check feed regularly** - some sites change their feed URLs
4. **Set reasonable expectations** - not all websites have RSS feeds
5. **Monitor ingestion logs** regularly in the admin panel

### Regular Maintenance

```sql
-- Check for inactive or failing sources
SELECT 
  ns.name,
  ns.rss_url,
  ns.is_active,
  COUNT(il.id) as ingestion_attempts,
  SUM(CASE WHEN il.status = 'error' THEN 1 ELSE 0 END) as failed_attempts
FROM news_sources ns
LEFT JOIN ingestion_logs il ON ns.id = il.source_id
WHERE ns.is_active = true
GROUP BY ns.id, ns.name, ns.rss_url, ns.is_active
HAVING SUM(CASE WHEN il.status = 'error' THEN 1 ELSE 0 END) > 3
ORDER BY failed_attempts DESC;
```

This query shows sources that have failed multiple times and may need attention.

## Additional Resources

- [RSS Feed Formats Guide](./FEED_FORMATS_GUIDE.md)
- [RSS Feeds Guide](./RSS_FEEDS_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Admin Access Guide](./ADMIN_ACCESS_GUIDE.md)
