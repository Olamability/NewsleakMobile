# Getting Started with Spazr News Aggregator

This guide will help you get the app running with sample data in under 10 minutes.

## Prerequisites

- Node.js 16+ installed
- A Supabase account (free tier is fine)
- Expo CLI or Expo Go app on your phone

## Quick Setup Steps

### 1. Clone and Install (2 minutes)

```bash
git clone https://github.com/Olamability/NewsleakMobile.git
cd NewsleakMobile
npm install
```

### 2. Set Up Supabase (5 minutes)

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `spazr-news` (or your choice)
   - Database Password: (create a strong password)
   - Region: (closest to you)
4. Click "Create new project" (takes ~2 minutes)

#### Run Database Setup

Once your project is ready:

1. Go to **SQL Editor** in the Supabase dashboard
2. Click "New query"
3. Copy the contents of `/supabase/schema.sql` and paste it
4. Click "Run" - this creates all tables, indexes, and seeds categories/sources

#### Add Sample Articles

1. Still in **SQL Editor**, create another new query
2. Copy the contents of `/supabase/sample-articles.sql` and paste it
3. Click "Run" - this adds 20+ sample articles so you can see data immediately

#### Get Your API Keys

1. Go to **Settings** → **API** in Supabase
2. Copy:
   - Project URL
   - anon/public key

### 3. Configure Environment (1 minute)

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start the App (1 minute)

```bash
npm start
```

Then:
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator
- Press `w` for Web Browser
- Scan QR code with Expo Go app

## What You'll See

✅ **20+ Sample Articles** across all categories
✅ **Breaking News** carousel with featured stories
✅ **Category Navigation** - browse by Tech, Sports, Business, etc.
✅ **Search Functionality** - search through articles
✅ **Trending Topics** - see what's popular

## Troubleshooting "No Articles Found"

If you see "No articles found" after setup:

### Check Database Connection

1. Open the app and check browser/device console for errors
2. Verify your `.env` file has correct Supabase credentials
3. Test connection in Supabase dashboard (should show "Active")

### Verify Sample Articles Were Added

1. Go to **Table Editor** in Supabase dashboard
2. Select `news_articles` table
3. You should see 20+ articles
4. If empty, re-run `supabase/sample-articles.sql`

### Check RLS Policies

The schema.sql includes public read policies, but verify:

1. Go to **Authentication** → **Policies** in Supabase
2. Check `news_articles` table has policy: "Public can view articles"
3. Policy should be: `FOR SELECT USING (true)`

### Force Refresh

1. In the app, pull down on the home screen to refresh
2. Or restart the app completely
3. Clear Expo cache: `npm start -- --clear`

## Next Steps

### Adding More Articles

You have several options:

1. **Manual Entry** (via Supabase Table Editor)
   - Go to Table Editor → news_articles
   - Click "Insert row" and fill in fields

2. **RSS Ingestion** (automated)
   - The app includes an ingestion service
   - Configure RSS feeds in the admin panel
   - Set up a cron job to fetch articles periodically

3. **Admin Panel** (see below)

### Accessing the Admin Dashboard

The app includes a full admin dashboard for managing sources and articles.

#### Set Up an Admin User

1. First, create a regular user account in the app (Sign Up)
2. Go to **Authentication** → **Users** in Supabase dashboard
3. Find your user and click to edit
4. In **User Metadata** (raw JSON), add:
   ```json
   {
     "is_admin": true
   }
   ```
5. Save changes
6. Sign out and sign in again in the app

#### Access the Dashboard

1. Open the app and go to the **Profile** tab
2. You'll see an "👑 Admin" badge
3. Tap **"⚙️ Admin Dashboard"**
4. From here you can:
   - View and manage news sources
   - Feature or hide articles
   - Monitor ingestion logs
   - Add new RSS sources

### Adding New News Sources

Two ways to add sources:

#### Via Admin Dashboard (Recommended)

1. Access admin dashboard (see above)
2. Tap "Manage Sources"
3. Tap "Add New Source"
4. Fill in:
   - Source name (e.g., "Reuters")
   - Website URL
   - RSS Feed URL
   - Logo URL (optional)
5. Save - the source will be available for ingestion

#### Via SQL Editor

```sql
INSERT INTO news_sources (name, website_url, rss_url, is_active)
VALUES (
  'Reuters',
  'https://www.reuters.com',
  'https://www.reuters.com/rssfeed/worldNews',
  true
);
```

### Setting Up RSS Ingestion

To automatically fetch articles from RSS feeds:

1. The `IngestionService` is already implemented in `src/services/ingestion.service.ts`
2. You'll need to set up a cron job or scheduled task to call it
3. Options:
   - Supabase Edge Functions with cron
   - External cron service (like cron-job.org)
   - Backend server with scheduled tasks

Example usage:
```typescript
import { IngestionService } from './src/services/ingestion.service';

// Fetch from all active sources
await IngestionService.ingestFromAllSources();

// Or from a specific source
await IngestionService.ingestFromSource(sourceId);
```

## Common Questions

### Why don't I see articles immediately after setup?

You need to run **both** SQL files:
1. `schema.sql` - creates tables and seeds sources/categories
2. `sample-articles.sql` - adds actual articles

The schema alone won't add articles to display.

### How do I test without Supabase?

The app requires Supabase for data. However, you can:
- Use the free Supabase tier (no credit card required)
- It takes only 5 minutes to set up
- You get 500MB database which is plenty for testing

### Can I use my own news sources?

Absolutely! Add them via:
1. Admin dashboard (once you set up an admin user)
2. Direct SQL insert into `news_sources` table
3. The app supports any RSS feed

### How often should I fetch from RSS feeds?

Recommended:
- Breaking news sources: Every 15-30 minutes
- Regular sources: Every 1-2 hours
- This balances freshness with API limits

## Development Tips

### Hot Reload

Save any file and the app auto-refreshes - no restart needed!

### Developer Menu

- **iOS Simulator**: Cmd+D
- **Android Emulator**: Cmd+M
- **Physical Device**: Shake the device

### Clear Cache

If things break:
```bash
npm start -- --clear
```

### TypeScript Errors

Run type check:
```bash
npm run typecheck
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

## Project Structure

```
NewsleakMobile/
├── supabase/
│   ├── schema.sql           # Database schema + seeds
│   └── sample-articles.sql  # Sample articles for testing
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # App screens
│   ├── services/            # Business logic & API calls
│   ├── lib/                 # React Query hooks
│   └── navigation/          # Navigation setup
└── App.tsx                  # Entry point
```

## Need Help?

- 📖 Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- 🐛 [Report a bug](https://github.com/Olamability/NewsleakMobile/issues)
- 📧 Email: support@spazr.com.ng

## What's Next?

Once you have the app running:

1. **Customize the UI** - Edit components in `src/components/`
2. **Add More Sources** - Via admin panel or SQL
3. **Set Up Push Notifications** - See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
4. **Deploy to App Stores** - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

Happy coding! 🚀
