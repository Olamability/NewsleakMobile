# 🚀 Spazr News - Deployment Instructions

## Overview
This guide will help you deploy the complete Spazr News mobile app to production, including Supabase backend and Google Play Store submission.

---

## 📋 Prerequisites

### Required Accounts
- [ ] Supabase account (https://supabase.com)
- [ ] Google Play Console account ($25 one-time fee)
- [ ] Expo account (https://expo.dev)
- [ ] AdMob account (https://admob.google.com)

### Required Tools
```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+

# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (Expo Application Services)
npm install -g eas-cli

# Install Supabase CLI
npm install -g supabase
```

---

## 🗄️ Step 1: Deploy Supabase Backend

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it securely!)
5. Wait for project to initialize (~2 minutes)

### 1.2 Run Database Schema
1. Open Supabase Studio → SQL Editor
2. Copy contents from `supabase/schema.sql`
3. Paste and run the SQL
4. Verify tables created in Table Editor

### 1.3 Get API Keys
1. Go to Project Settings → API
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` / `public` key
   - `service_role` key (keep secret!)

### 1.4 Create `.env` File
```bash
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 1.5 Deploy Edge Functions

#### Deploy RSS Ingest Function
```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy RSS ingest function
supabase functions deploy rss-ingest

# Set environment variables
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Deploy Push Notification Function
```bash
supabase functions deploy send-breaking-push
```

#### Set Up Cron Jobs (RSS Auto-Ingest)
1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create new job:
   ```sql
   select
     net.http_post(
       url:='https://your-project-id.supabase.co/functions/v1/rss-ingest',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     ) as request_id;
   ```
3. Schedule: `*/20 * * * *` (every 20 minutes)

---

## 📱 Step 2: Configure Mobile App

### 2.1 Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2.2 Configure App Settings

Edit `app.json`:
```json
{
  "expo": {
    "name": "Spazr News",
    "slug": "spazr-news",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.spazrnews",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E40AF"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.RECEIVE_BOOT_COMPLETED"
      ],
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 2.3 Test Locally
```bash
# Start development server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS simulator (Mac only)
npm run ios
```

---

## 💰 Step 3: Set Up AdMob (Monetization)

### 3.1 Create AdMob Account
1. Go to https://admob.google.com
2. Sign up with Google account
3. Add your app (Android)

### 3.2 Create Ad Units
Create the following ad units:
- **Banner Ad** (Home screen)
- **Native Ad** (Feed items)
- **Interstitial Ad** (Between articles)

### 3.3 Get Ad Unit IDs
Copy the Ad Unit IDs for each type (e.g., `ca-app-pub-xxxxx/yyyyy`)

### 3.4 Add to App
Update `.env`:
```env
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxxxx/banner-id
EXPO_PUBLIC_ADMOB_NATIVE_ID=ca-app-pub-xxxxx/native-id
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxx/interstitial-id
```

### 3.5 Add google-services.json
1. Download from Firebase Console
2. Place at `./google-services.json`

---

## 📦 Step 4: Build App with EAS

### 4.1 Configure EAS
```bash
# Login to Expo
eas login

# Initialize EAS
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 4.2 Build for Android
```bash
# Build production APK
eas build --platform android --profile production

# Or build AAB for Play Store
eas build --platform android --profile production --type app-bundle
```

Build will take 10-20 minutes. You'll get a download link when done.

### 4.3 Test the Build
```bash
# Install APK on device
adb install path/to/your-app.apk
```

Test thoroughly:
- [ ] Home feed loads
- [ ] Articles open correctly
- [ ] Search works
- [ ] Notifications permission requested
- [ ] Categories filter properly
- [ ] External links open in browser
- [ ] Pull-to-refresh works
- [ ] Infinite scroll works

---

## 🏪 Step 5: Submit to Google Play Store

### 5.1 Create Google Play Console Account
1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Complete account verification

### 5.2 Create App Listing
1. Click "Create App"
2. Fill in details:
   - **App Name**: Spazr News
   - **Default Language**: English (US)
   - **Type**: App
   - **Free/Paid**: Free

### 5.3 Complete Store Listing
Required information:
- **App Description**: 
  ```
  Spazr News is your go-to source for breaking news, trending stories, and in-depth articles from trusted publishers worldwide. 
  
  Features:
  • Breaking news alerts
  • Personalized news feed
  • Multiple categories (Politics, Sports, Tech, Entertainment)
  • Search news by topic or source
  • Save articles for later
  • Fast and ad-supported
  
  Stay informed with Spazr News!
  ```
- **Screenshots**: Minimum 2 (use screenshots from UI mockups)
- **App Icon**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Privacy Policy URL**: `https://yourwebsite.com/privacy`
- **Contact Email**: your@email.com

### 5.4 Content Rating
1. Complete questionnaire
2. Most likely: "Everyone" or "Teen" rating

### 5.5 Upload APK/AAB
1. Go to "Release" → "Production"
2. Click "Create new release"
3. Upload your `.aab` file from EAS build
4. Add release notes
5. Review and rollout

### 5.6 Review Process
- Google reviews typically take 1-7 days
- You'll get email when approved/rejected
- Fix any issues and resubmit if needed

---

## 🔔 Step 6: Configure Push Notifications

### 6.1 Test Push Notifications
```bash
# Send test notification via Supabase Edge Function
curl -X POST https://your-project-id.supabase.co/functions/v1/send-breaking-push \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 6.2 Set Up Breaking News Alerts
Create a trigger in Supabase:
```sql
create or replace function notify_breaking_news()
returns trigger as $$
begin
  if new.is_breaking = true then
    perform net.http_post(
      url:='https://your-project-id.supabase.co/functions/v1/send-breaking-push',
      headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_breaking_news
  after insert or update on news_articles
  for each row
  execute function notify_breaking_news();
```

---

## 🔐 Step 7: Security & Compliance

### 7.1 Privacy Policy (REQUIRED)
Create at `https://yourwebsite.com/privacy` with:
- Data collection practices
- How you use data
- Third-party services (Supabase, AdMob)
- User rights
- Contact information

Template: https://www.termsfeed.com/privacy-policy-generator/

### 7.2 Terms of Service
Create at `https://yourwebsite.com/terms`

### 7.3 Update App
Add links in `SettingsScreen.tsx`:
```typescript
const PRIVACY_POLICY_URL = 'https://yourwebsite.com/privacy';
const TERMS_URL = 'https://yourwebsite.com/terms';
```

---

## 📊 Step 8: Analytics & Monitoring

### 8.1 Monitor Supabase
- Check Database → Table Editor for article growth
- Monitor Edge Functions logs
- Set up database backups

### 8.2 Monitor App Performance
```bash
# Install Sentry (optional)
npm install @sentry/react-native

# Or use Expo's built-in analytics
eas build:configure --profile production
```

### 8.3 RSS Feed Management
Add RSS sources via Supabase Studio:
```sql
insert into news_sources (name, website_url, rss_url, logo_url, is_active)
values 
  ('Your News Source', 'https://example.com', 'https://example.com/rss', 'https://example.com/logo.png', true);
```

---

## ✅ Pre-Launch Checklist

### Backend
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Edge Functions deployed
- [ ] Cron jobs configured
- [ ] RSS sources added
- [ ] Test data populated

### Mobile App
- [ ] Environment variables set
- [ ] AdMob configured
- [ ] App icon and splash screen created
- [ ] Privacy policy and terms added
- [ ] Build tested on real device
- [ ] All screens working
- [ ] Push notifications working

### Play Store
- [ ] Google Play Console account created
- [ ] App listing completed
- [ ] Screenshots uploaded
- [ ] Content rating obtained
- [ ] Privacy policy URL added
- [ ] APK/AAB uploaded

### Legal
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Copyright compliance verified
- [ ] Publisher attribution present

---

## 🎯 Post-Launch

### Day 1
- [ ] Monitor crash reports
- [ ] Check notification delivery
- [ ] Verify RSS ingestion working
- [ ] Monitor user feedback

### Week 1
- [ ] Respond to reviews
- [ ] Fix critical bugs
- [ ] Add more RSS sources
- [ ] Optimize ad placement

### Month 1
- [ ] Analyze user retention
- [ ] Add new categories
- [ ] Improve search
- [ ] A/B test features

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache
npm run start:clear

# Remove node_modules
rm -rf node_modules
npm install --legacy-peer-deps
```

### Supabase Connection Issues
- Check `.env` file exists
- Verify API keys are correct
- Check RLS policies in Supabase

### Push Notifications Not Working
- Verify `expo-notifications` installed
- Check permissions granted
- Test with Expo Push Tool: https://expo.dev/notifications

### RSS Ingest Not Working
- Check Edge Function logs in Supabase
- Verify RSS URLs are valid
- Test manually: `curl https://feed-url.com/rss`

---

## 📞 Support Resources

- **Expo Docs**: https://docs.expo.dev
- **Supabase Docs**: https://supabase.com/docs
- **React Native Docs**: https://reactnative.dev/docs
- **Google Play Support**: https://support.google.com/googleplay/android-developer

---

## 🎉 Congratulations!

Your Spazr News app is now live on Google Play Store! 

**Next Steps:**
1. Market your app on social media
2. Add more news sources
3. Engage with users via reviews
4. Monitor analytics and improve

Good luck! 🚀
