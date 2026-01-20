# 🚀 Spazr News - Quick Start Guide

## What Was Built

A complete rebuild of the news aggregator mobile app with:

### ✅ Backend (Supabase)
- **Edge Functions**:
  - `rss-ingest/index.ts` - Automatically fetches and parses RSS feeds
  - `send-breaking-push/index.ts` - Sends push notifications for breaking news
- **Database Schema**: Already created at `supabase/schema.sql`

### ✅ Frontend (React Native Expo)
- **8 Components**:
  - `NewsCard.tsx` - Main article card
  - `BreakingNewsCard.tsx` - Breaking news card with red badge
  - `SponsoredCard.tsx` - Sponsored content (clearly labeled)
  - `CategoryPill.tsx` - Category filter chips
  - `SearchBar.tsx` - Search input
  - `RecentSearchChip.tsx` - Recent search chips
  - `TrendingTopicChip.tsx` - Trending topic buttons
  - `NotificationItem.tsx` - Notification list item

- **5 Screens**:
  - `HomeScreen.tsx` - Main feed with infinite scroll, categories, breaking news
  - `ArticleDetailScreen.tsx` - Article preview with "Read Full Story" button
  - `SearchScreen.tsx` - Search with trending topics and recent searches
  - `NotificationsScreen.tsx` - Push notification history
  - `SettingsScreen.tsx` - Basic settings and about

### ✅ Features
- Infinite scroll pagination
- Pull-to-refresh
- Breaking news carousel
- Category filtering
- Sponsored content injection (every 6 items)
- Full-text search
- Push notifications
- Analytics tracking
- External browser linking (Google Play compliant)

### ✅ Tech Stack
- React Native with Expo SDK 54
- TypeScript
- React Navigation (bottom tabs)
- TanStack Query (React Query)
- Zustand (state management)
- Supabase (backend)
- expo-notifications
- date-fns

### ✅ Theme
- **Primary Color**: #1E40AF (Spazr Blue)
- Clean, modern design
- Consistent spacing and typography

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Supabase
Create a `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Deploy Supabase Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy rss-ingest
supabase functions deploy send-breaking-push
```

### 4. Setup RSS Ingestion Cron
In Supabase SQL Editor:
```sql
SELECT cron.schedule(
  'rss-ingest-job',
  '*/30 * * * *',  -- Every 30 minutes
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/rss-ingest',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  )$$
);
```

### 5. Run the App
```bash
npm start
```

## 📱 Navigation Structure

```
Bottom Tabs:
├── Home          (🏠) - Main news feed
├── Search        (🔍) - Search with trending topics
├── Notifications (🔔) - Push notification history
└── Settings      (⚙️) - App settings

Stack:
└── ArticleDetail     - Article preview screen
```

## 🎯 Key Features Detail

### Home Screen
- **Category Pills**: Horizontal scroll at top
- **Breaking News**: Horizontal carousel (5 latest breaking stories)
- **Main Feed**: Infinite scroll with:
  - News articles from all sources
  - Sponsored content injected every 6 items
  - Pull-to-refresh
  - Automatic pagination

### Search Screen
- **Search Bar**: Debounced search input
- **Recent Searches**: User's last 10 searches (deletable)
- **Trending Topics**: Top 10 topics with search counts
- **Search Results**: Real-time filtered articles

### Article Detail Screen
- **Full-screen image**
- **Source attribution** (with logo if available)
- **Published time** ("2h ago" format)
- **Title and summary**
- **"Read Full Story" button** - Opens original article in browser

### Notifications Screen
- **List of push notifications**
- **Unread indicator** (blue dot)
- **Pull-to-refresh**
- **Tap to open article**

## 🔐 Google Play Compliance

✅ **Compliant**:
- Only displays article summaries (not full content)
- Links to original publisher websites
- Proper source attribution on every article
- "Read Full Story at [Source]" button required

❌ **Not Allowed**:
- Scraping full article content
- Displaying full articles in-app
- Removing publisher attribution

## 📊 Data Flow

```
RSS Sources → Edge Function (rss-ingest) → PostgreSQL → React Query → UI
                     ↓
              Breaking News Detection → Edge Function (send-breaking-push) → User Devices
```

## 🐛 Known Issues

1. **10 TypeScript errors** in legacy service files (not blocking):
   - `src/services/admin.service.ts`
   - `src/services/security.service.ts`
   - These are from old code and don't affect new Spazr functionality

2. **AdMob removed**: `expo-ads-admob` is deprecated
   - Use `react-native-google-mobile-ads` for monetization
   - Will need separate installation and configuration

## 📚 Next Steps

1. **Test on physical device** (push notifications require real device)
2. **Add environment variables** to Supabase and EAS
3. **Configure AdMob** for monetization
4. **Add more RSS sources** to Supabase
5. **Test RSS ingestion** function
6. **Submit to Google Play**

## 📖 Documentation

- Main README: `SPAZR_README.md`
- PRD: `PRD/Spazr_PRD.md`
- Database Schema: `supabase/schema.sql`
- UI Mockups: `UI/` folder

## 🚀 Deploy to Production

### Build with EAS
```bash
eas build:configure
eas build --platform android
```

### Submit to Google Play
```bash
eas submit --platform android
```

---

**Built with ❤️ for Spazr News**
