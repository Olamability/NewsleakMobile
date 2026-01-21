# Admin Panel Access Guide

## Overview

The **Admin Dashboard** is built directly into the Spazr News app (not a separate web interface). This guide shows you exactly how to access it and what you can do with it.

## 📍 Where is the Admin Panel?

The admin panel is located in the **Profile tab** of the mobile app. However, you need admin permissions to see it.

---

## ✅ Quick Access Steps

### Step 1: Set Up Admin Access (One-Time Setup)

Since the admin panel is controlled by user permissions, you need to grant yourself admin access through Supabase:

1. **Create a user account in the app**
   - Open the Spazr News app
   - Tap "Sign Up" 
   - Create your account with email/password
   - Remember the email address you used

2. **Grant admin access via Supabase**
   - Open your browser and go to [supabase.com](https://supabase.com)
   - Navigate to your project dashboard
   - Go to **Authentication** → **Users**
   - Find your user account (search by email)
   - Click on the user to edit

3. **Add admin metadata**
   - In the user details page, find **User Metadata** section
   - Click "Edit" or expand the JSON
   - Add the following JSON:
     ```json
     {
       "is_admin": true
     }
     ```
   - If there's existing metadata, merge it:
     ```json
     {
       "full_name": "Your Name",
       "is_admin": true
     }
     ```
   - Save changes

4. **Refresh app session**
   - Sign out of the app
   - Sign back in with the same account
   - The app will now recognize you as an admin

### Step 2: Access the Admin Dashboard

1. **Open the app** and make sure you're signed in
2. **Go to the Profile tab** (bottom navigation)
3. **Look for the admin section:**
   - You should see a "👑 Admin" badge under your name
   - Below that, an "Administration" section appears
   - Tap **"⚙️ Admin Dashboard"**

### Step 3: Navigate Admin Features

From the Admin Dashboard, you can access:

- **📰 Manage News Sources** - Add, enable, or disable RSS feeds
- **📄 Manage Articles** - Feature or remove articles
- **📊 Ingestion Logs** - Monitor RSS feed fetching

---

## 🎯 What You Can Do in the Admin Panel

### 1. Manage News Sources

**Purpose:** Add new RSS feeds or enable/disable existing ones.

**How to access:**
- Admin Dashboard → "Manage News Sources"

**Features:**
- View all news sources (active and inactive)
- Toggle sources on/off with a switch
- See source details (name, website URL, RSS URL)
- View how many sources are active

**Adding a New Source:**

Currently, the ManageSourcesScreen shows existing sources and allows toggling them on/off. To add a completely new source, you have two options:

#### Option A: Via SQL (Direct Method)
```sql
-- In Supabase SQL Editor
INSERT INTO news_sources (name, website_url, rss_url, is_active)
VALUES (
  'Reuters',
  'https://www.reuters.com',
  'https://feeds.reuters.com/reuters/worldNews',
  true
);
```

#### Option B: Via AddSourceModal (If Implemented)
Some versions of the app may have an "Add Source" button in the ManageSourcesScreen that opens a modal where you can:
- Enter source name
- Enter RSS feed URL
- Enter website URL
- Save and immediately activate

> **Note:** See [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for detailed instructions on adding RSS feeds.

### 2. Manage Articles

**Purpose:** Feature articles on the home screen or remove unwanted content.

**How to access:**
- Admin Dashboard → "Manage Articles"

**Features:**
- View all published articles
- Mark articles as "featured" (appears in breaking news carousel)
- Remove articles that violate guidelines
- View article stats

### 3. Ingestion Logs

**Purpose:** Monitor the RSS feed ingestion process.

**How to access:**
- Admin Dashboard → "Ingestion Logs"

**Features:**
- See recent ingestion attempts
- View success/failure status
- Check how many articles were fetched
- See error messages for failed ingestions
- Filter by source

**Example log entry:**
```
BBC News
Status: Success
Articles Fetched: 25
Articles Stored: 18
Duplicates: 7
Time: 2026-01-20 14:30:00
```

### 4. Dashboard Stats

The main dashboard shows:
- **Active Sources** - Number of enabled RSS feeds
- **Total Articles** - Total articles in database
- **Featured Articles** - Articles marked as featured
- **Users** - Total app users (if user auth is enabled)

---

## 🔒 Security & Permissions

### Who Can Access the Admin Panel?

Only users with `is_admin: true` in their user metadata can:
- See the Admin Dashboard menu item
- Access admin screens
- Modify sources and articles

Regular users will NOT see:
- The "👑 Admin" badge
- The "Administration" section in Profile
- Any admin-related menu items

### Admin Levels (Per PRD)

According to the Spazr PRD, the system supports multiple admin roles:

- **Editor** - Can manage articles and sources
- **Admin** - Can do everything editors can + manage users
- **Super Admin** - Full system access

Currently, the app uses a simple `is_admin: true/false` flag. Full role-based access control (RBAC) can be implemented later.

---

## 📱 Admin Panel vs Web Dashboard

### Current Implementation: Mobile Admin Panel

- ✅ Built into the React Native app
- ✅ Accessible from Profile tab
- ✅ Native mobile UI
- ✅ Works offline (for viewing)
- ✅ No separate deployment needed

### Future: Web Admin Dashboard (Per PRD)

The Spazr PRD (Appendix I) mentions a potential Next.js web dashboard:

```
/admin
  /dashboard
  /publishers
  /articles
  /push
```

This would provide:
- Larger screen for management
- Keyboard-friendly interface
- Bulk operations
- Advanced analytics

**Current Status:** The mobile admin panel handles all core needs. A web dashboard can be added later for power users.

---

## 🚀 Quick Start Checklist

Use this checklist to get started with the admin panel:

- [ ] Create user account in the app
- [ ] Go to Supabase → Authentication → Users
- [ ] Find your user and add `{"is_admin": true}` to metadata
- [ ] Sign out and sign back in
- [ ] Verify "👑 Admin" badge appears in Profile
- [ ] Access Admin Dashboard
- [ ] Check dashboard stats
- [ ] Go to Manage Sources
- [ ] Toggle a source on/off to test
- [ ] Add a new RSS source (via SQL or modal)
- [ ] Check Ingestion Logs to see fetching activity

---

## 💡 Tips & Best Practices

### 1. Start Small
- Add 5-10 sources initially
- Monitor ingestion logs for errors
- Scale up gradually

### 2. Test RSS Feeds First
Before adding a source, verify the RSS URL works:
```bash
# Open in browser to check if valid
https://feeds.reuters.com/reuters/worldNews
```

See [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for RSS testing tools.

### 3. Monitor Ingestion Regularly
- Check logs daily initially
- Look for failed ingestions
- Disable sources that consistently fail

### 4. Use Meaningful Source Names
❌ Bad: "Source 1"
✅ Good: "Reuters World News"

This helps when reviewing logs and managing sources.

### 5. Enable/Disable vs Delete
- Use the toggle switch to temporarily disable sources
- Only delete sources that are permanently wrong
- Disabled sources keep their ingestion history

---

## 🐛 Troubleshooting

### "I don't see the Admin Dashboard option"

**Possible causes:**
1. Admin metadata not set correctly
2. Didn't sign out/in after setting metadata
3. Wrong user account

**Solution:**
```sql
-- Check if your user has admin flag
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Should show: {"is_admin": true}
-- If not, update:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

Then sign out and sign back in.

### "Sources screen is empty"

**Cause:** No sources in the database yet.

**Solution:**
```sql
-- Add sample sources
INSERT INTO news_sources (name, website_url, rss_url, is_active) VALUES
  ('BBC News', 'https://www.bbc.com/news', 'http://feeds.bbci.co.uk/news/rss.xml', true),
  ('TechCrunch', 'https://techcrunch.com', 'https://techcrunch.com/feed/', true);
```

See [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for more sources.

### "Ingestion logs show errors"

**Common errors:**

1. **"Invalid RSS URL"**
   - Check if RSS URL is correct
   - Test in browser
   - Ensure it returns XML

2. **"No articles found in feed"**
   - Feed might be empty
   - Feed might require authentication
   - Try alternative RSS URL from same site

3. **"Timeout"**
   - Site might be slow
   - Network issues
   - Try again later

### "Articles not showing after enabling source"

**Cause:** Sources don't auto-fetch when toggled.

**Solution:**
- Wait for scheduled ingestion (if set up)
- Or manually trigger ingestion:
  ```typescript
  import { IngestionService } from './services/ingestion.service';
  const service = new IngestionService();
  await service.ingestFromAllSources();
  ```

See [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md#automated-ingestion) for automated setup.

---

## 📚 Related Documentation

- **[RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md)** - Complete guide to adding RSS feeds
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Initial app setup
- **[ADMIN_ACCESS_GUIDE.md](./ADMIN_ACCESS_GUIDE.md)** - Original admin access docs
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - General troubleshooting
- **[PRD/Spazr_PRD.md](./PRD/Spazr_PRD.md)** - Product requirements (Appendix H & I for admin)

---

## 🎓 Video Tutorial (Optional)

If you're a visual learner, here's a quick walkthrough:

1. **Setup:** 0:00-2:00 - Grant admin access via Supabase
2. **Access:** 2:00-3:00 - Find admin panel in Profile
3. **Sources:** 3:00-5:00 - Manage RSS sources
4. **Logs:** 5:00-6:00 - Review ingestion logs
5. **Articles:** 6:00-7:00 - Feature articles

*(Note: Video to be recorded and linked here)*

---

## ✅ You're Ready!

Now you know:
- ✅ Where the admin panel is located
- ✅ How to access it
- ✅ What features it includes
- ✅ How to add and manage RSS feeds
- ✅ How to troubleshoot common issues

**Next Steps:**
1. Set up admin access
2. Add your first RSS source
3. Monitor ingestion logs
4. See [RSS_FEEDS_GUIDE.md](./RSS_FEEDS_GUIDE.md) for adding more sources

---

**Happy administrating! 👑**
