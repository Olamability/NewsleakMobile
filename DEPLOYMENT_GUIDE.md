# NewsLeak Mobile - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Local Development](#local-development)
5. [Building for Production](#building-for-production)
6. [Deployment Strategies](#deployment-strategies)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Tools
- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ or **yarn**: v1.22+
- **Expo CLI**: v6+ (`npm install -g expo-cli`)
- **EAS CLI**: Latest (`npm install -g eas-cli`)
- **Git**: v2.30+

### Required Accounts
- **Expo Account**: [expo.dev](https://expo.dev)
- **Supabase Account**: [supabase.com](https://supabase.com)
- **Apple Developer Account** (for iOS): $99/year
- **Google Play Developer Account** (for Android): $25 one-time

### Development Environment
- **macOS**: Required for iOS development
- **Xcode**: v14+ (for iOS)
- **Android Studio**: Latest (for Android)
- **iOS Simulator / Android Emulator**

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/Olamability/NewsleakMobile.git
cd NewsleakMobile
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# UTM Tracking (Optional)
EXPO_PUBLIC_UTM_SOURCE=newsleak_app
EXPO_PUBLIC_UTM_MEDIUM=referral
EXPO_PUBLIC_UTM_CAMPAIGN=news_aggregation

# Feature Flags (Optional)
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_OFFLINE=true
EXPO_PUBLIC_ENABLE_ADS=false
```

**Security Notes:**
- Never commit `.env` to version control
- `.env` is already in `.gitignore`
- Use different keys for dev/staging/prod

---

## Supabase Configuration

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Set project name: "newsleak-mobile"
4. Choose region (closest to users)
5. Set strong database password
6. Wait for project creation (~2 minutes)

### 2. Database Schema Setup

Execute the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- News Sources Table
CREATE TABLE news_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rss_url TEXT,
  website_url TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles Table
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT,
  content_snippet TEXT,
  image_url TEXT,
  source_id UUID REFERENCES news_sources(id),
  source_name TEXT NOT NULL,
  source_url TEXT,
  article_url TEXT NOT NULL UNIQUE,
  canonical_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  language TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks Table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Reading History Table
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion Logs Table
CREATE TABLE ingestion_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES news_sources(id),
  source_name TEXT NOT NULL,
  status TEXT NOT NULL, -- success, error, in_progress
  articles_fetched INTEGER DEFAULT 0,
  articles_processed INTEGER DEFAULT 0,
  articles_duplicates INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free', -- free, premium, pro
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  auto_renew BOOLEAN DEFAULT false,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_articles_published ON news_articles(published_at DESC);
CREATE INDEX idx_articles_category ON news_articles(category);
CREATE INDEX idx_articles_featured ON news_articles(is_featured);
CREATE INDEX idx_articles_views ON news_articles(view_count DESC);
CREATE INDEX idx_sources_active ON news_sources(is_active);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
```

### 3. Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Bookmarks Policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Reading History Policies
CREATE POLICY "Users can view own history"
  ON reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own history"
  ON reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Subscription Policies
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin Policies (require is_admin in user_metadata)
CREATE POLICY "Admins can manage sources"
  ON news_sources FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);

CREATE POLICY "Admins can manage articles"
  ON news_articles FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
```

### 4. Seed Data (Optional)

```sql
-- Insert sample news sources
INSERT INTO news_sources (name, rss_url, website_url, is_active) VALUES
  ('BBC News', 'http://feeds.bbci.co.uk/news/rss.xml', 'https://www.bbc.com/news', true),
  ('TechCrunch', 'https://techcrunch.com/feed/', 'https://techcrunch.com', true),
  ('The Guardian', 'https://www.theguardian.com/world/rss', 'https://www.theguardian.com', true);
```

### 5. Get API Keys

1. Go to Project Settings → API
2. Copy `URL` → Use as `EXPO_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → Use as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## Local Development

### Start Development Server

```bash
# Start Expo dev server
npm start
# or
expo start

# Start with cache cleared
npm run start:clear
```

### Run on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser (limited functionality)
npm run web
```

### Development Workflow

1. **Code Changes**: Auto-reload on save
2. **Hot Reload**: Press `r` in terminal
3. **Debug Menu**: Shake device or press `d`
4. **Clear Cache**: `npm run start:clear`

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

---

## Building for Production

### 1. Configure EAS

Initialize EAS (first time only):
```bash
eas login
eas init
```

Create `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-prod-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-prod-key"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Configure app.json

Update `app.json` with production settings:
```json
{
  "expo": {
    "name": "NewsLeak",
    "slug": "newsleak-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.newsleak",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.newsleak",
      "versionCode": 1,
      "permissions": []
    }
  }
}
```

### 3. Build Commands

```bash
# Build for iOS (TestFlight)
eas build --platform ios --profile production

# Build for Android (Play Store)
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile production

# Preview build (internal testing)
eas build --platform ios --profile preview
```

### 4. Submit to Stores

#### iOS (App Store)
```bash
eas submit --platform ios

# Or manual:
# 1. Download .ipa from EAS
# 2. Upload via Xcode or Transporter
# 3. Submit for review in App Store Connect
```

#### Android (Play Store)
```bash
eas submit --platform android

# Or manual:
# 1. Download .aab from EAS
# 2. Upload to Play Console
# 3. Create release and submit for review
```

---

## Deployment Strategies

### A. Continuous Deployment (Recommended)

Use GitHub Actions:

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Stores

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npx eas-cli build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### B. Staged Rollout

1. **Development**: Internal testing (EAS Updates)
2. **Beta**: TestFlight/Internal Testing (limited users)
3. **Production**: Gradual rollout (10% → 50% → 100%)

### C. Feature Flags

Use environment variables for feature toggling:
```typescript
const FEATURES = {
  offline: process.env.EXPO_PUBLIC_ENABLE_OFFLINE === 'true',
  analytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ads: process.env.EXPO_PUBLIC_ENABLE_ADS === 'true',
};
```

---

## Post-Deployment

### 1. Verify Deployment

- [ ] App launches successfully
- [ ] Login/signup works
- [ ] Articles load correctly
- [ ] Search functionality works
- [ ] Bookmarks save/load
- [ ] Admin panel accessible (for admins)
- [ ] Offline reading works (if enabled)
- [ ] Push notifications work (if implemented)

### 2. Set Up Monitoring

**Sentry (Error Tracking):**
```bash
npm install @sentry/react-native
```

**Analytics:**
- Firebase Analytics
- Mixpanel
- Amplitude

**Performance:**
- Firebase Performance Monitoring
- New Relic

### 3. Configure Background Jobs

Set up cron jobs for:
- RSS feed ingestion (every 30 minutes)
- Credibility score updates (daily)
- Cache cleanup (daily)
- Analytics aggregation (hourly)

Example using GitHub Actions:
```yaml
name: RSS Ingestion
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Ingestion
        run: |
          # Call backend ingestion endpoint
          curl -X POST https://your-backend/api/ingest
```

### 4. Set Up Alerts

Configure alerts for:
- High error rate (>1%)
- Slow API responses (>2s)
- Crash rate (>0.1%)
- Failed ingestions
- Security incidents

---

## Monitoring & Maintenance

### Daily Checks
- [ ] App launches without crashes
- [ ] Latest articles loading
- [ ] Ingestion logs show success
- [ ] No security alerts

### Weekly Tasks
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Update featured articles
- [ ] Review user feedback

### Monthly Tasks
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] Feature usage analysis

### Quarterly Tasks
- [ ] Major version updates
- [ ] UX improvements
- [ ] A/B testing new features
- [ ] Compliance review (GDPR, etc.)

---

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache
expo start -c
rm -rf node_modules
npm install

# Check EAS build logs
eas build:list
```

#### Environment Variables Not Working
- Ensure `.env` exists
- Restart dev server
- Variables must start with `EXPO_PUBLIC_`

#### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Confirm tables exist

#### App Crashes on Launch
- Check error logs in Sentry
- Verify all required permissions
- Test on clean device

---

## Rollback Procedure

### If Issues Arise Post-Deployment:

1. **OTA Update** (fastest):
```bash
eas update --branch production
```

2. **Previous Build** (app stores):
- iOS: Use "Phased Release" to halt rollout
- Android: Use "Staged Rollout" controls

3. **Hotfix**:
```bash
git revert <bad-commit>
git push
eas build --platform all --profile production
```

---

## Security Checklist

Pre-deployment security review:

- [ ] No hardcoded secrets in code
- [ ] Environment variables properly secured
- [ ] HTTPS only
- [ ] Input validation on all user inputs
- [ ] Rate limiting enabled
- [ ] RLS policies configured
- [ ] Admin permissions verified
- [ ] Data encryption at rest
- [ ] Secure token storage
- [ ] GDPR compliance implemented

---

## Support & Resources

- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **React Native**: https://reactnative.dev

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained By**: NewsLeak Mobile Team
