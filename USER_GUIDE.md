# Spazr News Aggregator - User Guide

Welcome to Spazr News! This guide will help you understand how to use the app, access admin features, and add RSS feeds for real-time news scraping.

## Table of Contents

1. [Getting Started](#getting-started)
2. [How to Access Admin Features](#how-to-access-admin-features)
3. [How to Add RSS Feeds](#how-to-add-rss-feeds)
4. [Troubleshooting](#troubleshooting)
5. [FAQ](#faq)

---

## Getting Started

### Creating Your Account

1. Open the Spazr News app
2. Tap **"Create Account"** or **"Sign Up"**
3. Enter your email and password
4. Tap **"Sign Up"**
5. You're now registered!

**Note:** By default, new accounts are **regular user accounts**. To access admin features (like adding RSS feeds), you need to grant yourself admin privileges. See below.

---

## How to Access Admin Features

### Understanding Admin Access

The app has **two types of users**:

- **Regular Users**: Can read news, bookmark articles, and manage their profile
- **Admin Users**: Can add/manage RSS feeds, manage news sources, and control the news aggregation system

### Why Can't I See the RSS Feed Management?

**Important:** RSS feed management is only available to admin users. If you just created an account, you are a regular user by default and will NOT see the admin dashboard or RSS feed options.

### How to Grant Yourself Admin Access

Follow these steps to make your account an admin account:

#### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project (the one you created for this app)

2. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"**
   - Click **"Users"**

3. **Find Your User Account**
   - Look for your email in the user list
   - Click on your user to view details

4. **Edit User Metadata**
   - Scroll down to **"User Metadata"** section
   - You'll see raw JSON data
   - Click **"Edit"** or directly edit the JSON

5. **Add Admin Flag**
   - Update the JSON to include `"is_admin": true`
   - Your metadata should look like this:
   ```json
   {
     "full_name": "Your Name",
     "is_admin": true
   }
   ```
   - If the metadata is empty, add:
   ```json
   {
     "is_admin": true
   }
   ```

6. **Save Changes**
   - Click **"Save"** or **"Update"**

7. **Sign Out and Sign In Again**
   - **Important:** You MUST sign out and sign back in for the change to take effect
   - In the app, go to **Profile** tab
   - Tap **"Sign Out"**
   - Sign in again with your credentials

8. **Verify Admin Access**
   - After signing back in, go to **Profile** tab
   - You should see a **"👑 Admin"** badge under your name
   - You should see an **"Administration"** section with **"⚙️ Admin Dashboard"**

#### Method 2: Using SQL (Advanced)

If you prefer using SQL, you can run this query in the Supabase SQL Editor:

1. **Open SQL Editor**
   - In Supabase Dashboard, click **"SQL Editor"**
   - Click **"New query"**

2. **Run This Query**
   ```sql
   -- Replace 'your-email@example.com' with your actual email
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
   WHERE email = 'your-email@example.com';
   ```

3. **Click "Run"**

4. **Verify the Change**
   ```sql
   -- Check that it was updated
   SELECT email, raw_user_meta_data
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```
   - You should see `"is_admin": true` in the `raw_user_meta_data` column

5. **Sign Out and Sign In Again in the App**

---

## How to Add RSS Feeds

### Prerequisites

**Before you can add RSS feeds, you MUST:**
1. ✅ Have an admin account (see "How to Grant Yourself Admin Access" above)
2. ✅ Be signed into the app
3. ✅ Have Supabase properly configured

### Step-by-Step: Adding RSS Feeds via Admin Dashboard

Once you have admin access, follow these steps:

#### 1. Access the Admin Dashboard

1. Open the app
2. Go to the **Profile** tab (bottom navigation)
3. Verify you see the **"👑 Admin"** badge
4. Tap on **"⚙️ Admin Dashboard"** (under the Administration section)

#### 2. Navigate to Manage Sources

1. In the Admin Dashboard, tap **"📰 Manage News Sources"**
2. You'll see a list of existing news sources (if any)

#### 3. Check if "Add Source" Button Exists

The current implementation shows existing sources and allows you to enable/disable them. 

**To add a new RSS feed source**, you have two options:

##### Option A: Via Supabase Dashboard (Currently Required)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click **"Table Editor"** in the left sidebar

2. **Open news_sources Table**
   - Click on the **`news_sources`** table

3. **Insert New Row**
   - Click **"Insert"** → **"Insert row"**
   - Fill in the fields:
     - `name`: Name of the news source (e.g., "Reuters World News")
     - `website_url`: Homepage URL (e.g., "https://www.reuters.com")
     - `rss_url`: The RSS feed URL (e.g., "https://feeds.reuters.com/reuters/worldNews")
     - `logo_url`: (Optional) URL to the source's logo
     - `is_active`: Set to `true` to enable it immediately
   - Click **"Save"**

4. **Verify in App**
   - Go back to the app
   - Navigate to **Admin Dashboard** → **Manage Sources**
   - Pull down to refresh
   - You should see your new source in the list!

##### Option B: Via SQL Query

1. **Open SQL Editor** in Supabase Dashboard

2. **Run This Query**
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

3. **Add Multiple Sources at Once**
   ```sql
   INSERT INTO news_sources (name, website_url, rss_url, logo_url, is_active) VALUES
     ('BBC World News', 'https://www.bbc.com/news', 'http://feeds.bbci.co.uk/news/world/rss.xml', null, true),
     ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', null, true),
     ('Al Jazeera', 'https://www.aljazeera.com', 'https://www.aljazeera.com/xml/rss/all.xml', null, true);
   ```

4. **Click "Run"**

5. **Refresh in App** to see the new sources

#### 4. Enable/Disable Sources

Once sources are added:

1. Go to **Admin Dashboard** → **Manage Sources**
2. You'll see all sources with toggle switches
3. Toggle the switch to enable/disable a source
4. Disabled sources won't be used for RSS ingestion

### How to Trigger RSS Ingestion

After adding RSS feeds, you need to fetch articles from them.

**Currently, you need to set up automated ingestion.** The app includes the ingestion service but requires cron job setup:

1. **Manual Option (Development/Testing)**
   - The ingestion service is at `src/services/ingestion.service.ts`
   - You can trigger it programmatically (requires code changes)

2. **Automated Option (Recommended for Production)**
   - Deploy the Supabase Edge Function at `/supabase/functions/rss-ingest/`
   - Set up a cron job to run it every 1-2 hours
   - See [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for detailed instructions

### Finding RSS Feed URLs

Not sure where to find RSS feed URLs? Here are some tips:

#### Common RSS URL Patterns

Try these patterns for any website:
- `https://example.com/rss`
- `https://example.com/feed`
- `https://example.com/rss.xml`
- `https://example.com/feed.xml`

#### Popular News Sources

Here are some popular RSS feeds you can add:

**General News:**
- BBC World News: `http://feeds.bbci.co.uk/news/world/rss.xml`
- Reuters World: `https://feeds.reuters.com/reuters/worldNews`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`

**Technology:**
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`
- Ars Technica: `https://feeds.arstechnica.com/arstechnica/index`
- Hacker News: `https://hnrss.org/frontpage`

**Business:**
- CNBC: `https://www.cnbc.com/id/100003114/device/rss/rss.html`

**See More:** Check [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for an extensive list of news sources and RSS feeds.

---

## Troubleshooting

### I Don't See the Admin Dashboard

**Problem:** After signing in, I don't see the Admin Dashboard option in my Profile.

**Solution:**
1. Make sure you've set `is_admin: true` in your user metadata (see above)
2. **Sign out completely** and sign back in
3. Check the Profile tab - you should see a "👑 Admin" badge
4. If still not showing, verify the change in Supabase:
   - Go to Authentication → Users
   - Click on your user
   - Check User Metadata has `"is_admin": true`

### I Can't Add RSS Feeds in the App

**Problem:** There's no "Add New Source" button in the Manage Sources screen.

**Current Status:** The Manage Sources screen currently shows existing sources and allows you to enable/disable them. To add new sources, you need to:
- Use Supabase Table Editor (see "Option A" above)
- Use SQL queries (see "Option B" above)

**Future Enhancement:** A full "Add Source" form in the app is planned for a future update.

### Articles Aren't Showing Up After Adding RSS Feed

**Problem:** I added a source but no articles appear.

**Solution:**
1. **Check if source is active:**
   - Go to Admin Dashboard → Manage Sources
   - Make sure the toggle switch is ON (green)

2. **Trigger ingestion:**
   - RSS feeds need to be fetched either manually or via cron job
   - Check [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for ingestion setup

3. **Verify the RSS URL:**
   - Open the RSS URL in a browser
   - It should show XML/RSS content
   - If it shows an error, the URL is incorrect

### Database Connection Error

**Problem:** I get errors about Supabase connection.

**Solution:**
1. Check your `.env` file has correct credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Verify your Supabase project is active (not paused)
3. Check your internet connection
4. Restart the app: `npm start -- --clear`

---

## FAQ

### Q: Do I need to be an admin to read news?

**A:** No! Regular users can:
- Read all news articles
- Search for articles
- Bookmark articles
- Browse by category

You only need admin access to **manage** the news sources and RSS feeds.

### Q: Can I have multiple admin users?

**A:** Yes! You can grant admin access to any user account by setting `is_admin: true` in their user metadata.

### Q: Is admin access secure?

**A:** The current implementation only restricts admin features in the UI. For production use:
- Add server-side permission checks in your API/backend
- Implement Row Level Security (RLS) policies in Supabase
- See [ADMIN_ACCESS_GUIDE.md](./ADMIN_ACCESS_GUIDE.md) for security best practices

### Q: How often should RSS feeds be fetched?

**A:** Recommended:
- Breaking news sources: Every 15-30 minutes
- Regular news: Every 1-2 hours  
- This balances freshness with API/bandwidth limits

### Q: Can I remove my admin access?

**A:** Yes! Follow the same steps to edit user metadata, but set `"is_admin": false` or remove the field entirely. Sign out and back in for the change to take effect.

### Q: I followed all steps but still can't see admin features

**A:** Double-check:
1. ✅ User metadata has `"is_admin": true` (check in Supabase)
2. ✅ You signed OUT completely and signed back IN
3. ✅ You're looking in the Profile tab (not Settings)
4. ✅ The app is using the correct Supabase project

If still not working, check the app console for errors or contact support.

---

## Additional Resources

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide with sample data
- **[RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md)** - Comprehensive RSS feed management guide
- **[ADMIN_ACCESS_GUIDE.md](./ADMIN_ACCESS_GUIDE.md)** - Detailed admin access documentation
- **[ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md)** - Admin panel features
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## Need Help?

- 📧 Email: support@spazr.com.ng
- 🐛 Report bugs: [GitHub Issues](https://github.com/Olamability/NewsleakMobile/issues)
- 📖 Full Documentation: [README.md](./README.md)

---

**Happy news reading! 📰**
