# How to Add RSS Feeds from Different Sites

## Overview

The Spazr News app has a complete RSS aggregation system that can automatically fetch news articles from any RSS or Atom feed. This guide shows you how to add new RSS feeds from different news sites.

## Table of Contents
- [Quick Start](#quick-start)
- [Method 1: Via Admin Dashboard (Recommended)](#method-1-via-admin-dashboard-recommended)
- [Method 2: Via SQL](#method-2-via-sql)
- [Method 3: Via API/Service](#method-3-via-apiservice)
- [Finding RSS Feeds](#finding-rss-feeds)
- [Testing RSS Feeds](#testing-rss-feeds)
- [Automated Ingestion](#automated-ingestion)
- [Popular News Sources](#popular-news-sources)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**5-Minute Guide to Add a New RSS Feed:**

1. **Find the RSS feed URL** (e.g., `https://feeds.reuters.com/reuters/worldNews`)
2. **Add to database** (via Admin Dashboard or SQL)
3. **Trigger ingestion** (manual or automated)
4. **Articles appear in app** automatically!

---

## Method 1: Via Admin Dashboard (Recommended)

This is the easiest method if you have admin access set up.

### Step 1: Access Admin Dashboard

1. Open the app and go to **Profile** tab
2. Tap **"⚙️ Admin Dashboard"**
3. Tap **"Manage Sources"**

> **Don't see Admin Dashboard?** Set up admin access first - see [GETTING_STARTED.md](./GETTING_STARTED.md#accessing-the-admin-dashboard)

### Step 2: Add New Source

1. Tap **"Add New Source"** button
2. Fill in the form:
   - **Source Name:** Name of the news outlet (e.g., "Reuters")
   - **Website URL:** Homepage URL (e.g., "https://www.reuters.com")
   - **RSS Feed URL:** The RSS feed URL (e.g., "https://feeds.reuters.com/reuters/worldNews")
   - **Logo URL:** (Optional) URL to the source's logo
   - **Category:** (Optional) Default category for articles
3. Tap **"Save"**

### Step 3: Trigger Ingestion

1. Find the newly added source in the list
2. Tap **"Fetch Articles"** or wait for automated ingestion
3. Articles will be fetched and processed automatically

---

## Method 2: Via SQL

If you prefer direct database access, use Supabase SQL Editor.

### Step 1: Open SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **"New query"**

### Step 2: Insert New Source

```sql
-- Add a single news source
INSERT INTO news_sources (name, website_url, rss_url, is_active)
VALUES (
  'Reuters World News',
  'https://www.reuters.com',
  'https://feeds.reuters.com/reuters/worldNews',
  true
);
```

### Step 3: Add Multiple Sources at Once

```sql
-- Add multiple sources in one query
INSERT INTO news_sources (name, website_url, rss_url, logo_url, is_active) VALUES
  ('Al Jazeera', 'https://www.aljazeera.com', 'https://www.aljazeera.com/xml/rss/all.xml', 'https://example.com/aljazeera-logo.png', true),
  ('TechRadar', 'https://www.techradar.com', 'https://www.techradar.com/rss', 'https://example.com/techradar-logo.png', true),
  ('The Verge', 'https://www.theverge.com', 'https://www.theverge.com/rss/index.xml', 'https://example.com/verge-logo.png', true),
  ('Ars Technica', 'https://arstechnica.com', 'https://feeds.arstechnica.com/arstechnica/index', 'https://example.com/ars-logo.png', true);
```

### Step 4: Verify Sources Were Added

```sql
-- Check your new sources
SELECT id, name, rss_url, is_active 
FROM news_sources 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Method 3: Via API/Service

For programmatic access, use the IngestionService.

### In Your App Code

```typescript
import { IngestionService } from './src/services/ingestion.service';
import { supabase } from './src/services/supabase';

// Add source via API
async function addNewSource(sourceName: string, rssUrl: string, websiteUrl: string) {
  const { data, error } = await supabase
    .from('news_sources')
    .insert({
      name: sourceName,
      website_url: websiteUrl,
      rss_url: rssUrl,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding source:', error);
    return null;
  }

  // Immediately fetch articles from new source
  const ingestionService = new IngestionService();
  const result = await ingestionService.ingestFromSource(data);
  
  console.log(`Fetched ${result.articlesStored} articles from ${sourceName}`);
  return data;
}

// Usage
await addNewSource('Reuters', 'https://feeds.reuters.com/reuters/worldNews', 'https://www.reuters.com');
```

---

## Finding RSS Feeds

### How to Find RSS Feeds for Popular Sites

#### Method 1: Look for RSS Icons
Many news sites display an RSS icon (🗗) or link labeled "RSS Feed" in their footer or navigation.

#### Method 2: Common RSS URL Patterns
Try these common patterns by replacing `example.com` with the site's domain:

- `https://example.com/rss`
- `https://example.com/feed`
- `https://example.com/rss.xml`
- `https://example.com/feed.xml`
- `https://www.example.com/rss/index.xml`

#### Method 3: View Page Source
1. Go to the website
2. View page source (Ctrl+U or Cmd+U)
3. Search for "rss" or "feed"
4. Look for `<link rel="alternate" type="application/rss+xml">`

#### Method 4: Use RSS Feed Finder Tools
- **RSS Finder Browser Extensions** (Chrome/Firefox)
- **feedrabbit.com** - Enter URL to find feeds
- **rssbox.eu** - RSS feed finder

### Example: Finding BBC News RSS Feed

1. Go to https://www.bbc.com/news
2. Scroll to footer
3. Look for "RSS Feeds" link
4. Choose your category (e.g., Top Stories)
5. Copy the RSS URL (e.g., `http://feeds.bbci.co.uk/news/rss.xml`)

---

## Testing RSS Feeds

Before adding a feed, test it to ensure it's valid and returns articles.

### Online RSS Validators

1. **FeedValidator**: https://validator.w3.org/feed/
   - Paste RSS URL
   - Click "Check"
   - Should show "Valid RSS feed"

2. **RSS Feed Reader Test**
   - Open in browser: `https://feedrabbit.com/?url=YOUR_RSS_URL`
   - Should display recent articles

### Test in Your App

```typescript
import { RSSService } from './src/services/rss.service';

// Test RSS feed before adding
async function testRSSFeed(feedUrl: string) {
  try {
    // Validate URL format
    if (!RSSService.isValidFeedUrl(feedUrl)) {
      console.error('Invalid RSS URL format');
      return false;
    }

    // Try fetching articles
    const rssService = new RSSService();
    const articles = await rssService.parseFeed(feedUrl);
    
    console.log(`✓ Feed is valid! Found ${articles.length} articles`);
    console.log('Sample article:', articles[0]?.title);
    return true;
  } catch (error) {
    console.error('✗ Feed test failed:', error);
    return false;
  }
}

// Test a feed
await testRSSFeed('https://feeds.reuters.com/reuters/worldNews');
```

---

## Automated Ingestion

Once you've added RSS sources, set up automated fetching.

### Option 1: Manual Trigger (Testing)

```typescript
import { IngestionService } from './src/services/ingestion.service';

const ingestionService = new IngestionService();

// Fetch from all active sources
const results = await ingestionService.ingestFromAllSources();
console.log(`Fetched articles from ${results.length} sources`);

// Fetch from specific source
await ingestionService.triggerManualIngestion('source-id-here');
```

### Option 2: Supabase Edge Function (Recommended)

The app includes a ready-to-use Edge Function at `/supabase/functions/rss-ingest/`.

**Deploy the function:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy rss-ingest
```

**Set up cron trigger:**
1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create new cron job:
   ```sql
   SELECT cron.schedule(
     'rss-ingestion',
     '0 */2 * * *', -- Every 2 hours
     $$
     SELECT net.http_post(
       url := 'https://YOUR_PROJECT.supabase.co/functions/v1/rss-ingest',
       headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'::jsonb
     );
     $$
   );
   ```

### Option 3: External Cron Service

Use services like:
- **Cron-job.org** (Free tier available)
- **EasyCron** 
- **AWS Lambda + EventBridge**

Set up a cron job to call your ingestion endpoint every 1-2 hours.

---

## Popular News Sources

### General News

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('BBC World News', 'https://www.bbc.com/news', 'http://feeds.bbci.co.uk/news/world/rss.xml', true),
  ('Reuters World', 'https://www.reuters.com', 'https://feeds.reuters.com/reuters/worldNews', true),
  ('Al Jazeera', 'https://www.aljazeera.com', 'https://www.aljazeera.com/xml/rss/all.xml', true),
  ('Associated Press', 'https://apnews.com', 'https://feeds.apnews.com/rss/topnews', true);
```

### Technology

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', true),
  ('The Verge', 'https://www.theverge.com', 'https://www.theverge.com/rss/index.xml', true),
  ('Ars Technica', 'https://arstechnica.com', 'https://feeds.arstechnica.com/arstechnica/index', true),
  ('Hacker News', 'https://news.ycombinator.com', 'https://hnrss.org/frontpage', true),
  ('Wired', 'https://www.wired.com', 'https://www.wired.com/feed/rss', true);
```

### Business

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('Bloomberg', 'https://www.bloomberg.com', 'https://feeds.bloomberg.com/markets/news.rss', true),
  ('Financial Times', 'https://www.ft.com', 'https://www.ft.com/?format=rss', true),
  ('CNBC', 'https://www.cnbc.com', 'https://www.cnbc.com/id/100003114/device/rss/rss.html', true),
  ('Wall Street Journal', 'https://www.wsj.com', 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', true);
```

### Sports

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('ESPN', 'https://www.espn.com', 'https://www.espn.com/espn/rss/news', true),
  ('Sky Sports', 'https://www.skysports.com', 'https://www.skysports.com/rss/12040', true),
  ('Bleacher Report', 'https://bleacherreport.com', 'https://bleacherreport.com/articles/feed', true);
```

### Science & Health

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('Scientific American', 'https://www.scientificamerican.com', 'http://rss.sciam.com/ScientificAmerican-Global', true),
  ('New Scientist', 'https://www.newscientist.com', 'https://www.newscientist.com/feed/home', true),
  ('WebMD Health News', 'https://www.webmd.com', 'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', true);
```

---

## Troubleshooting

### Feed Not Fetching Articles

**Problem:** Added source but no articles appear

**Solutions:**

1. **Check if feed is active:**
   ```sql
   SELECT name, is_active, rss_url 
   FROM news_sources 
   WHERE name = 'Your Source Name';
   ```
   Set `is_active = true` if needed.

2. **Test RSS URL manually:**
   - Open RSS URL in browser
   - Should display XML/RSS content
   - If shows error, RSS URL is incorrect

3. **Check ingestion logs:**
   ```sql
   SELECT * FROM ingestion_logs 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   Look for error messages.

4. **Trigger manual ingestion:**
   ```typescript
   const result = await ingestionService.triggerManualIngestion('source-id');
   console.log('Errors:', result.errors);
   ```

### Articles Are Duplicates

**Problem:** Same articles appearing multiple times

**Solution:** The system has built-in deduplication by:
- Article URL
- Content hash

If duplicates still appear, check:
```sql
-- Find duplicates by title
SELECT title, COUNT(*) 
FROM news_articles 
GROUP BY title 
HAVING COUNT(*) > 1;
```

### Feed URL Returns 403/401 Error

**Problem:** "Access denied" or authentication error

**Solutions:**

1. Some feeds require a user agent:
   - The app already sets a custom User-Agent
   - Some sites may block automated requests

2. Try alternative feed URLs:
   - `/feed` instead of `/rss.xml`
   - `/rss` instead of `/feed.xml`

3. Contact site owner for API access

### Articles Have Wrong Category

**Problem:** Articles classified in wrong category

**Solution:** The system auto-detects categories using keywords. You can:

1. **Set default category for source:**
   ```sql
   -- If schema supports category_id
   UPDATE news_sources 
   SET category_id = (SELECT id FROM categories WHERE slug = 'technology')
   WHERE name = 'TechCrunch';
   ```

2. **Update article categories manually:**
   ```sql
   UPDATE news_articles 
   SET category_id = (SELECT id FROM categories WHERE slug = 'sports')
   WHERE source_name = 'ESPN';
   ```

---

## Best Practices

### 1. Start with a Few Sources
- Add 5-10 sources initially
- Monitor performance and quality
- Scale up gradually

### 2. Set Appropriate Ingestion Frequency
- **Breaking news sources:** Every 15-30 minutes
- **Regular news:** Every 1-2 hours
- **Weekly sources:** Once per day

### 3. Monitor Ingestion Logs
```sql
-- Check recent ingestion success rate
SELECT 
  source_name,
  status,
  articles_fetched,
  articles_stored,
  completed_at
FROM ingestion_logs
ORDER BY completed_at DESC
LIMIT 20;
```

### 4. Clean Up Inactive Sources
```sql
-- Disable sources that consistently fail
UPDATE news_sources 
SET is_active = false 
WHERE id IN (
  SELECT source_id 
  FROM ingestion_logs 
  WHERE status = 'error' 
  GROUP BY source_id 
  HAVING COUNT(*) > 10
);
```

### 5. Validate Before Adding
Always test RSS feeds before adding them to production.

---

## Additional Resources

- **RSS Service Documentation:** `/src/services/rss.service.ts`
- **Ingestion Service Documentation:** `/src/services/ingestion.service.ts`
- **RSS Aggregation Engine:** [RSS_AGGREGATION_ENGINE.md](./RSS_AGGREGATION_ENGINE.md)
- **API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- Open an issue on GitHub

---

**Happy news aggregating! 🚀**
