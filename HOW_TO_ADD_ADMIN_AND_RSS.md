# How to Add Admin Users and Test RSS Feeds

This guide explains how to add users as admins and test news sites by adding RSS feeds.

## Quick Start: Adding Admin Users

### Method 1: Supabase Dashboard (Easiest)

1. **Log into Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project dashboard

2. **Find Your User**:
   - Go to **Authentication** → **Users**
   - Search for the user by email

3. **Add Admin Role**:
   - Click on the user to edit
   - Find the **User Metadata** section
   - Add or update the JSON:
     ```json
     {
       "is_admin": true
     }
     ```
   - If there's existing metadata (like `full_name`), merge it:
     ```json
     {
       "full_name": "John Doe",
       "is_admin": true
     }
     ```
   - Save changes

4. **Refresh Session**:
   - The user must **sign out and sign back in** for changes to take effect

### Method 2: SQL Query

Run this in your Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'user@example.com';
```

Replace `'user@example.com'` with the actual user's email.

## Accessing Admin Features

Once a user is admin:

1. **Open the app** and sign in with the admin account
2. **Go to Profile tab** (bottom navigation)
3. **Look for the "👑 Admin" badge** under your name
4. **Tap "⚙️ Admin Dashboard"** in the Administration section

## Adding RSS Feeds for Testing

### Step 1: Access Manage Sources

From the Admin Dashboard:
- Tap **"Manage News Sources"**
- You'll see a list of all news sources

### Step 2: Add a New RSS Feed

#### Option A: Via the App (If Add Button Exists)
1. Tap the **"Add Source"** button (➕)
2. Fill in the form:
   - **Name**: Display name (e.g., "BBC World News")
   - **Website URL**: Main site URL (e.g., "https://www.bbc.com/news")
   - **RSS Feed URL**: The RSS/Atom feed URL
3. Toggle **"Active"** to enable immediately
4. Save

#### Option B: Via SQL (Direct Method)
Run this in Supabase SQL Editor:

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active)
VALUES (
  'BBC World News',
  'https://www.bbc.com/news',
  'http://feeds.bbci.co.uk/news/world/rss.xml',
  true
);
```

### Step 3: Monitor Ingestion

1. From Admin Dashboard, tap **"Ingestion Logs"**
2. Check for:
   - ✅ Success status
   - Articles fetched count
   - Error messages (if any)

### Popular RSS Feeds for Testing

Here are some reliable RSS feeds you can use:

```sql
-- Tech News
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', true),
  ('The Verge', 'https://www.theverge.com', 'https://www.theverge.com/rss/index.xml', true),
  ('Wired', 'https://www.wired.com', 'https://www.wired.com/feed/rss', true);

-- General News
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('BBC News', 'https://www.bbc.com/news', 'http://feeds.bbci.co.uk/news/rss.xml', true),
  ('Reuters World', 'https://www.reuters.com', 'https://feeds.reuters.com/reuters/worldNews', true),
  ('CNN Top Stories', 'https://www.cnn.com', 'http://rss.cnn.com/rss/cnn_topstories.rss', true);

-- Business
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('Bloomberg', 'https://www.bloomberg.com', 'https://www.bloomberg.com/feed/podcast/business-news.xml', true),
  ('Forbes', 'https://www.forbes.com', 'https://www.forbes.com/real-time/feed2/', true);

-- Sports
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('ESPN', 'https://www.espn.com', 'https://www.espn.com/espn/rss/news', true),
  ('Sky Sports', 'https://www.skysports.com', 'https://www.skysports.com/rss/12040', true);
```

## Troubleshooting

### "I don't see the Admin Dashboard option"

**Possible causes:**
1. Admin metadata not set correctly
2. Didn't sign out/in after setting metadata
3. Wrong user account

**Solution:**
```sql
-- Check if user has admin flag
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- If not showing {"is_admin": true}, update:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

Then **sign out and sign back in**.

### "RSS feed not working"

**Common issues:**
1. **Invalid URL**: Test the RSS URL in a browser - it should return XML
2. **Feed requires auth**: Some feeds need authentication
3. **Timeout**: Try again later or check network

**How to test RSS URL:**
- Open the RSS URL in your browser
- Should see XML content with `<rss>` or `<feed>` tags
- Check for `<item>` or `<entry>` elements with articles

### "Articles not appearing after enabling source"

**Cause:** RSS ingestion may be scheduled or manual.

**Solution:**
- Check **Ingestion Logs** for the source
- Wait for next scheduled ingestion (if automated)
- Or manually trigger via backend (if implemented)

## Managing Existing Sources

### Enable/Disable Sources
1. Go to **Admin Dashboard** → **Manage Sources**
2. Use the toggle switch next to each source
3. Disabled sources won't be fetched but keep their history

### View Source Stats
- Active sources count shown on Dashboard
- Individual source details in Manage Sources screen
- Ingestion history in Ingestion Logs

## Best Practices

1. **Start Small**: Add 5-10 sources initially and monitor
2. **Test RSS First**: Verify RSS URLs work before adding
3. **Monitor Regularly**: Check ingestion logs for errors
4. **Disable, Don't Delete**: Toggle sources off instead of deleting
5. **Use Meaningful Names**: "Reuters World News" not "Source 1"

## Security Note

⚠️ **Important**: 
- Only grant admin access to trusted users
- Admin roles should be managed server-side in production
- Current implementation is UI-only - add backend validation before production

## Categories Available

The app supports these categories for article classification:
- **Top Stories** (ID: 1)
- **Breaking** (ID: 2)
- **Politics** (ID: 3)
- **Business** (ID: 4)
- **Sports** (ID: 5)
- **Technology** (ID: 6)
- **Entertainment** (ID: 7)
- **Health** (ID: 8)
- **Lifestyle** (ID: 9)
- **Environment** (ID: 10)

Articles are automatically categorized during RSS ingestion based on content analysis.

## Additional Resources

- **Complete Admin Guide**: See `ADMIN_PANEL_GUIDE.md`
- **RSS Feed Guide**: See `RSS_FEEDS_GUIDE.md` (if available)
- **Troubleshooting**: See `TROUBLESHOOTING.md`

---

**You're all set!** 🎉

Create your admin account, add some RSS feeds, and start testing your news aggregator in real-time.
