# Spazr News - Mobile News Aggregator App

A mobile-first news aggregator app built with React Native Expo and Supabase, designed for high engagement and fast content delivery.

## 🚀 Features

- **News Feed**: Infinite scroll feed with categorized news articles
- **Breaking News**: Horizontal carousel for breaking news stories
- **Categories**: Filter news by Politics, Sports, Business, Tech, and more
- **Search**: Full-text search with trending topics and recent searches
- **Push Notifications**: Breaking news alerts
- **Sponsored Content**: Monetization through sponsored articles
- **Google Play Compliant**: Only displays summaries with links to original sources

## 📱 Tech Stack

### Frontend
- **React Native** with Expo (~54.0.31)
- **TypeScript** for type safety
- **React Navigation** for routing
- **TanStack Query** for data fetching and caching
- **Zustand** for state management
- **Expo Notifications** for push notifications

### Backend
- **Supabase** (PostgreSQL + Edge Functions)
- **RSS Ingestion** via Supabase Edge Functions
- **Real-time data** with Supabase subscriptions

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### 2. Clone and Install
\`\`\`bash
git clone <repository-url>
cd NewsleakMobile
npm install
\`\`\`

### 3. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### Run Database Schema
\`\`\`bash
# In Supabase SQL Editor, run:
supabase/schema.sql
\`\`\`

#### Deploy Edge Functions
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy rss-ingest
supabase functions deploy send-breaking-push
\`\`\`

### 4. Environment Variables
Create a \`.env\` file:
\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

### 5. Run the App
\`\`\`bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
\`\`\`

## 📂 Project Structure

\`\`\`
NewsleakMobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── NewsCard.tsx
│   │   ├── BreakingNewsCard.tsx
│   │   ├── SponsoredCard.tsx
│   │   ├── CategoryPill.tsx
│   │   ├── SearchBar.tsx
│   │   └── ...
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── ArticleDetailScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── lib/                 # Core utilities
│   │   ├── supabase.ts      # Supabase client
│   │   ├── queries.ts       # React Query hooks
│   │   ├── notifications.ts # Push notifications
│   │   └── helpers.ts       # Utility functions
│   ├── types/               # TypeScript types
│   │   ├── news.ts
│   │   └── supabase.ts
│   └── constants/           # Theme and constants
│       └── theme.ts
├── supabase/
│   ├── schema.sql           # Database schema
│   └── functions/           # Edge Functions
│       ├── rss-ingest/
│       └── send-breaking-push/
├── App.tsx                  # App entry point
└── package.json
\`\`\`

## 🎨 Branding

- **App Name**: Spazr News
- **Primary Color**: #1E40AF (Blue)
- **Theme**: Clean, modern, Opera News-inspired

## 🔐 Google Play Compliance

- ✅ Only displays article summaries (not full content)
- ✅ Links to original publisher websites
- ✅ Proper source attribution
- ✅ "Read Full Story" button for each article

## 📊 Database Schema

### Main Tables
- **categories**: News categories (Politics, Sports, etc.)
- **news_sources**: RSS feed sources
- **news_articles**: Aggregated news articles
- **sponsored_content**: Sponsored posts
- **user_devices**: Push notification tokens
- **trending_topics**: Popular search terms
- **recent_searches**: User search history

## 🚀 Deployment

### Build with EAS
\`\`\`bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
\`\`\`

### Submit to Stores
\`\`\`bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
\`\`\`

## 🔧 Configuration

### RSS Ingestion Schedule
Edit Supabase Edge Function cron:
\`\`\`sql
SELECT cron.schedule(
  'rss-ingest-job',
  '*/30 * * * *',  -- Every 30 minutes
  $$SELECT net.http_post(url := 'https://your-project.supabase.co/functions/v1/rss-ingest')$$
);
\`\`\`

### AdMob Integration
1. Create AdMob account
2. Add App IDs in app.json
3. Configure ad units in monetization settings

## 📝 Scripts

\`\`\`bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run lint       # Lint code
npm run typecheck  # TypeScript check
npm test           # Run tests
\`\`\`

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify environment variables are set
- Check Supabase project status
- Enable Row Level Security policies

### Push Notifications Not Working
- Ensure physical device (not simulator)
- Check notification permissions
- Verify Expo push token registration

### Build Errors
\`\`\`bash
# Clear cache and rebuild
npm start --clear
\`\`\`

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/Olamability/NewsleakMobile/issues)
- Email: support@spazr.com

## 🎯 Roadmap

- [ ] Offline reading mode
- [ ] Article bookmarking
- [ ] User personalization
- [ ] Multi-language support
- [ ] Dark mode
- [ ] iOS app release

---

Built with ❤️ by the Spazr Team
