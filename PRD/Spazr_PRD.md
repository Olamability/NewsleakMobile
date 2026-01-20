# Product Requirements Document (PRD)

## Product Name
**NewsArena** (placeholder – replace with final brand name)

## Product Vision
Build a **mobile-first, AI-powered news aggregator app similar to Opera News**, focused on high engagement, fast content delivery, and monetization through ads, sponsored content, and traffic redirection — while remaining **Google Play–policy compliant**.

The app will aggregate news from multiple publishers (including owned sites like **spazr.com.ng**) using RSS feeds, store and process content via **Supabase**, and display short summaries with a link to the original source.

---

## Target Platforms
- Android (Primary – Google Play Store)
- iOS (Secondary – optional later)

---

## Core Goals
1. Aggregate news automatically from multiple sources
2. Display short summaries (not full articles)
3. Monetize via in-app ads & sponsored content
4. Push breaking news notifications
5. Scale into a publisher distribution platform (like Opera)

---

## Tech Stack (MANDATORY)

### Frontend (Mobile App)
- React Native (Expo – managed workflow)
- TypeScript
- Expo Router (file-based navigation)
- React Query / TanStack Query
- Zustand or Context API (state)
- Expo Notifications
- Google AdMob

### Backend
- Supabase
  - PostgreSQL database
  - Supabase Auth (optional login)
  - Edge Functions (Deno)
  - Supabase Storage (images/logos)

### AI & Automation
- AI Coding Agent (Copilot / Cursor / Devin-style)
- RSS ingestion script (Node / Deno)

---

## App Structure (High Level)

```
Mobile App
 ├── Home Feed (personalized news)
 ├── Categories (Politics, Sports, Tech, etc.)
 ├── Breaking News
 ├── Article Preview Screen
 ├── External WebView / Browser Redirect
 ├── Search
 ├── Notifications
 └── Settings

Backend (Supabase)
 ├── news_sources
 ├── news_articles
 ├── categories
 ├── users (optional)
 ├── sponsored_content
 └── analytics_events
```

---

## Content Rules (Google Play Safe)

- ❌ Do NOT scrape full articles
- ✅ Store title, summary, image, source, timestamp
- ✅ Always show publisher name
- ✅ "Read Full Article" opens original site

---

## Database Schema (Supabase – PostgreSQL)

### categories
```
id (uuid, pk)
name (text)
slug (text)
created_at (timestamp)
```

### news_sources
```
id (uuid, pk)
name (text)
website_url (text)
rss_url (text)
logo_url (text)
is_active (boolean)
created_at (timestamp)
```

### news_articles
```
id (uuid, pk)
source_id (fk → news_sources.id)
category_id (fk → categories.id)
title (text)
summary (text)
image_url (text)
original_url (text)
published_at (timestamp)
is_breaking (boolean)
is_sponsored (boolean)
created_at (timestamp)
```

### sponsored_content
```
id (uuid, pk)
title (text)
summary (text)
image_url (text)
cta_url (text)
start_date (date)
end_date (date)
budget (numeric)
created_at (timestamp)
```

### analytics_events
```
id (uuid, pk)
event_type (text)
article_id (uuid)
user_id (uuid, nullable)
created_at (timestamp)
```

---

## Backend Logic

### RSS Ingestion
- Scheduled job (cron or Supabase Edge Function)
- Fetch RSS feeds
- Clean HTML
- Generate AI summaries (optional)
- Deduplicate by URL/title
- Insert into `news_articles`

### Breaking News Logic
- If keywords match or manual flag → `is_breaking = true`
- Trigger push notification

---

## Frontend UX / UI Guidelines

### Design Style
- Opera-like card feed
- Rounded cards
- Soft shadows
- Fast vertical scrolling
- Brand color (NOT red – choose blue, purple, or green)

### Home Feed
- Mixed content:
  - News articles
  - Native ads
  - Sponsored posts

### Article Card
- Image
- Title (bold)
- Source name + time
- 2–3 line summary

### Article View
- Preview only
- "Read Full Article" button

---

## Monetization Strategy

### Phase 1
- Google AdMob (banner + native)

### Phase 2
- Sponsored articles
- Sponsored push notifications

### Phase 3
- Affiliate links
- Optional premium subscription (ad-free)

---

## Notifications

- Breaking news alerts
- Category-based notifications
- Sponsored push (clearly labeled)

---

## Security & Compliance

- Privacy Policy required
- Terms of Service
- Attribution to publishers
- No misleading content ownership

---

## Deployment

### Backend
- Supabase project
- Environment variables
- Edge Functions deployed

### App
- Expo EAS Build
- Google Play Store release

---

# MASTER PROMPT FOR AI CODING AGENT (USE THIS AS-IS)

---

**ROLE:** You are a senior mobile engineer, backend architect, and product designer.

**TASK:** Build a full production-ready **Opera News–style mobile news aggregator app** using **React Native Expo + Supabase**.

**REQUIREMENTS:**
1. Generate the complete Supabase backend:
   - SQL schema
   - RLS policies
   - Edge Functions
   - RSS ingestion logic
2. Generate the complete Expo app:
   - File-based routing
   - Home feed
   - Categories
   - Article preview
   - External article redirect
   - Push notifications
   - AdMob integration
3. Ensure:
   - Google Play compliance
   - No copyrighted full content
   - Clean UI/UX similar to Opera but unique branding
4. Output code that:
   - Runs without errors
   - Uses environment variables
   - Is ready for production

**CONSTRAINTS:**
- Use TypeScript everywhere
- Do NOT assume proprietary APIs
- Use Supabase SDK only
- Use Expo-managed workflow

**FINAL OUTPUT:**
- Backend SQL & functions
- Frontend Expo app structure
- Setup instructions
- Deployment checklist

---

## Success Criteria
✅ App builds successfully
✅ Supabase schema runs without errors
✅ RSS ingestion works
✅ News displays correctly
✅ Ads show
✅ Push notifications fire

---

## Long-Term Vision
Evolve into a **publisher distribution platform**, allowing external publishers to submit feeds and advertisers to buy traffic — exactly like Opera News.

---

# APPENDIX A: SUPABASE SQL SCHEMA + RLS (PRODUCTION‑READY)

## 1. Enable Extensions
```sql
create extension if not exists "uuid-ossp";
```

## 2. Categories Table
```sql
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default now()
);
```

## 3. News Sources Table
```sql
create table news_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website_url text not null,
  rss_url text not null,
  logo_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);
```

## 4. News Articles Table
```sql
create table news_articles (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references news_sources(id) on delete cascade,
  category_id uuid references categories(id),
  title text not null,
  summary text not null,
  image_url text,
  original_url text unique not null,
  published_at timestamp with time zone,
  is_breaking boolean default false,
  is_sponsored boolean default false,
  created_at timestamp with time zone default now()
);
```

## 5. Sponsored Content Table
```sql
create table sponsored_content (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary text not null,
  image_url text,
  cta_url text not null,
  start_date date,
  end_date date,
  budget numeric,
  created_at timestamp with time zone default now()
);
```

## 6. Analytics Events Table
```sql
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  article_id uuid references news_articles(id),
  user_id uuid,
  created_at timestamp with time zone default now()
);
```

## 7. Row Level Security (PUBLIC READ)
```sql
alter table categories enable row level security;
alter table news_sources enable row level security;
alter table news_articles enable row level security;
alter table sponsored_content enable row level security;

create policy "public read categories" on categories for select using (true);
create policy "public read sources" on news_sources for select using (true);
create policy "public read articles" on news_articles for select using (true);
create policy "public read sponsored" on sponsored_content for select using (true);
```

---

# APPENDIX B: EXPO APP STRUCTURE (OPERA‑STYLE)

## Folder Structure
```
/app
  /(tabs)
    index.tsx            // Home Feed
    categories.tsx
    breaking.tsx
    search.tsx
    settings.tsx
  /article
    [id].tsx             // Article Preview
/components
  NewsCard.tsx
  SponsoredCard.tsx
  CategoryPill.tsx
  AdBanner.tsx
/lib
  supabase.ts
  queries.ts
  ads.ts
  notifications.ts
/types
  news.ts
/app.config.ts
```

## Supabase Client
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

## Home Feed Logic
- Fetch latest `news_articles`
- Inject sponsored content every N items
- Inject AdMob native ads

## Article Preview Screen
- Display title, image, summary
- Show source attribution
- Button: "Read Full Article" → opens original_url

## Monetization Components
- AdMob banner at bottom
- Native ads in feed
- SponsoredCard clearly labeled

---

# APPENDIX C: BUILD & DEPLOY CHECKLIST

## Supabase
- Create project
- Run SQL in order
- Add RSS sources
- Enable anon public read

## Expo
- Set env variables
- Configure AdMob IDs
- Enable notifications
- Build with EAS

---

# APPENDIX D: RSS INGESTION (EDGE FUNCTION – PRODUCTION READY)

## Purpose
Automatically fetch RSS feeds, clean content, deduplicate articles, and insert safe summaries into Supabase.

## Function Name
`rss-ingest`

## Runtime
- Supabase Edge Function (Deno)
- Scheduled via Supabase Cron (every 10–30 minutes)

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Logic Flow
1. Fetch active RSS sources from `news_sources`
2. Parse RSS XML
3. Extract:
   - title
   - link (original_url)
   - pubDate
   - image (if available)
4. Clean HTML → plain text
5. Generate short summary (first 2–3 sentences only)
6. Check duplicate by `original_url`
7. Insert into `news_articles`

## Deno Edge Function (TypeScript)
```ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Parser from 'https://esm.sh/rss-parser@3.13.0';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const parser = new Parser();

  const { data: sources } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true);

  for (const source of sources || []) {
    const feed = await parser.parseURL(source.rss_url);

    for (const item of feed.items.slice(0, 10)) {
      if (!item.link) continue;

      const summary = item.contentSnippet?.slice(0, 300) || item.title;

      await supabase.from('news_articles').upsert({
        source_id: source.id,
        title: item.title,
        summary,
        original_url: item.link,
        image_url: item.enclosure?.url || null,
        published_at: item.pubDate ? new Date(item.pubDate) : null
      }, { onConflict: 'original_url' });
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

## Cron Setup
```
*/20 * * * *
```

---

# APPENDIX E: HOME FEED QUERY & PAGINATION (OPERA‑STYLE)

## Goal
Fast infinite scrolling feed prioritizing:
- Fresh news
- Breaking news
- Sponsored content injection

## Query Strategy
- Order by `published_at DESC`
- Limit + offset pagination
- Inject sponsored content every 6 items

## Supabase Query (Frontend)
```ts
export async function fetchHomeFeed(page = 0, pageSize = 20) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('news_articles')
    .select(`id, title, summary, image_url, published_at, is_breaking, news_sources(name)`)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data;
}
```

## Breaking News Priority
- If `is_breaking = true`, pin to top for first 30 minutes

## Sponsored Injection Logic
```ts
function injectSponsored(feed, sponsored) {
  const result = [];
  feed.forEach((item, index) => {
    result.push(item);
    if ((index + 1) % 6 === 0 && sponsored.length) {
      result.push(sponsored.shift());
    }
  });
  return result;
}
```

---

# APPENDIX F: PUSH NOTIFICATIONS (BREAKING NEWS SYSTEM)

## Goal
Deliver **Opera-style breaking news push notifications** that increase retention and monetization, while remaining Google Play compliant.

---

## Notification Types

### 1. Breaking News (Primary)
- Triggered when `is_breaking = true`
- Sent immediately
- High priority

### 2. Category Alerts (Optional)
- User-subscribed categories
- Medium priority

### 3. Sponsored Push (Clearly Labeled)
- Paid notifications
- Must include "Sponsored" label

---

## Architecture

```
Supabase DB
  └── news_articles (is_breaking = true)
        ↓
Supabase Edge Function
        ↓
Expo Push API
        ↓
User Devices
```

---

## Required Tables

### user_devices
```sql
create table user_devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  expo_push_token text unique not null,
  platform text,
  created_at timestamp with time zone default now()
);

alter table user_devices enable row level security;
create policy "public insert device" on user_devices for insert with check (true);
create policy "public read device" on user_devices for select using (true);
```

---

## Frontend (Expo)

### Request Permission & Register Token
```ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPush() {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
```

### Save Token to Supabase
```ts
await supabase.from('user_devices').insert({
  expo_push_token: token,
  platform: Platform.OS
});
```

---

## Edge Function: Send Breaking News Push

### Function Name
`send-breaking-push`

### Logic
1. Fetch latest breaking news
2. Fetch all push tokens
3. Send notification via Expo Push API

### Deno Edge Function
```ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: article } = await supabase
    .from('news_articles')
    .select('title, id')
    .eq('is_breaking', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (!article) return new Response('No breaking news');

  const { data: devices } = await supabase
    .from('user_devices')
    .select('expo_push_token');

  const messages = devices?.map(d => ({
    to: d.expo_push_token,
    sound: 'default',
    title: 'Breaking News',
    body: article.title,
    data: { articleId: article.id }
  })) || [];

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages)
  });

  return new Response(JSON.stringify({ sent: messages.length }), { status: 200 });
});
```

---

## Notification Tap Behavior

- App opens
- Navigates to `/article/[id]`
- Article preview loads

---

## Anti-Spam Rules (Very Important)

- Max 3 breaking pushes per day
- No misleading headlines
- Sponsored pushes must be labeled
- Allow users to disable notifications

---

## Monetization Use

- Paid breaking news alerts
- Political campaign promotions
- Affiliate flash alerts

---

## Success Metrics

- Push opt-in rate
- CTR on notifications
- Retention uplift

---

# APPENDIX G: PUBLISHER ONBOARDING & DISTRIBUTION PLATFORM (OPERA‑STYLE)

## Goal
Transform the app from a simple aggregator into a **publisher distribution platform**, where external publishers submit RSS feeds and advertisers buy reach — exactly how Opera News scales.

---

## Publisher Model

### Publisher Types
1. **Owned Publisher** (e.g. spazr.com.ng)
2. **Partner Publisher** (manual approval)
3. **Premium Publisher** (paid boost & analytics)

---

## Required Tables

### publishers
```sql
create table publishers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  website_url text not null,
  contact_email text,
  status text default 'pending', -- pending | approved | suspended
  created_at timestamp with time zone default now()
);

alter table publishers enable row level security;
create policy "public insert publisher" on publishers for insert with check (true);
create policy "admin read publisher" on publishers for select using (true);
```

### publisher_sources
```sql
create table publisher_sources (
  id uuid primary key default uuid_generate_v4(),
  publisher_id uuid references publishers(id) on delete cascade,
  rss_url text not null,
  category_id uuid references categories(id),
  is_active boolean default false,
  created_at timestamp with time zone default now()
);
```

---

## Publisher Submission Flow (No Login Required)

1. Publisher fills form:
   - Site name
   - Website URL
   - RSS feed URL
   - Category
   - Contact email

2. Data stored as `pending`
3. Admin reviews
4. Admin activates feed
5. RSS ingestion automatically includes publisher

---

## Admin Approval Logic

- Only approved publishers appear in feeds
- Suspended publishers are excluded
- Manual quality control (anti‑spam)

---

## Premium Publisher Features (Phase 2)

- Feed boosting
- Priority placement
- Sponsored tagging
- Performance analytics
- Push eligibility

---

## Revenue Streams from Publishers

- Monthly subscription (₦ / $)
- Pay‑per‑boost
- Sponsored push notifications
- Geo‑targeted distribution

---

## UI: Publisher Submission Screen (App or Web)

Fields:
- Publisher Name
- Website
- RSS URL
- Category
- Contact Email

CTA: **Submit for Review**

---

## Quality & Compliance Rules

- No scraped or plagiarized feeds
- Must show original source attribution
- No misleading headlines
- Auto‑suspend repeated violations

---

## Long‑Term Vision

Evolve into a **regional Opera‑style content network** where:
- Publishers depend on your traffic
- Advertisers pay for reach
- You control distribution

---

# APPENDIX H: ADMIN DASHBOARD SCHEMA (CONTROL CENTER)

## Goal
Provide a **central admin system** to manage content, publishers, monetization, and moderation — similar to Opera News internal tools.

---

## Admin Access Model

- Admins are **not normal app users**
- Admin access is controlled via Supabase Auth + role column
- Dashboard can be:
  - Simple web app (Next.js / Vite)
  - Supabase Studio (early stage)

---

## Required Tables

### admin_users
```sql
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'editor', -- editor | admin | super_admin
  created_at timestamp with time zone default now()
);

alter table admin_users enable row level security;
create policy "admins only" on admin_users
for all using (auth.uid() = id);
```

---

### article_moderation
```sql
create table article_moderation (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  status text default 'approved', -- approved | hidden | flagged
  reason text,
  reviewed_by uuid references admin_users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

---

### publisher_reviews
```sql
create table publisher_reviews (
  id uuid primary key default uuid_generate_v4(),
  publisher_id uuid references publishers(id) on delete cascade,
  decision text default 'pending', -- approved | rejected
  notes text,
  reviewed_by uuid references admin_users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

---

### monetization_logs
```sql
create table monetization_logs (
  id uuid primary key default uuid_generate_v4(),
  type text, -- ad | sponsored | affiliate | push
  reference_id uuid,
  amount numeric,
  currency text default 'NGN',
  created_at timestamp with time zone default now()
);
```

---

### push_campaigns
```sql
create table push_campaigns (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  is_sponsored boolean default false,
  status text default 'draft', -- draft | scheduled | sent
  scheduled_at timestamp with time zone,
  created_by uuid references admin_users(id),
  created_at timestamp with time zone default now()
);
```

---

## Admin Capabilities (Mapped to Tables)

| Feature | Table |
|------|------|
| Approve publishers | publishers / publisher_reviews |
| Enable RSS feeds | publisher_sources |
| Hide or flag articles | article_moderation |
| Send push campaigns | push_campaigns |
| Track revenue | monetization_logs |

---

## Security Rules (Critical)

- Only admins can:
  - Approve publishers
  - Send push campaigns
  - Hide content
- Public users have **read-only access**
- Service role key only used in Edge Functions

---

## Future Enhancements (Optional)

- Admin analytics dashboard
- Publisher performance metrics
- Automated spam detection
- Revenue charts

---

## Why This Matters

This schema ensures:
- Full editorial control
- Legal safety
- Monetization visibility
- Platform scalability

This is the **same internal structure** used by large news aggregators.

---

# APPENDIX I: ADMIN DASHBOARD UI (NEXT.JS – MINIMAL & PRODUCTION READY)

## Goal
Provide a **simple, secure web-based admin dashboard** for managing publishers, content, pushes, and monetization.

---

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase JS SDK

---

## Folder Structure
```
/admin
  /app
    /login
      page.tsx
    /dashboard
      page.tsx
    /publishers
      page.tsx
    /articles
      page.tsx
    /push
      page.tsx
  /lib
    supabase.ts
    auth.ts
```

---

## Auth Guard (Admins Only)
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function requireAdmin(userId: string) {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role;
}
```

---

## Core Screens

### Dashboard
- Total articles
- Active publishers
- Push sent today
- Estimated revenue

### Publishers
- Pending → approve / reject
- Activate RSS feeds

### Articles
- Hide / flag content
- Mark as breaking

### Push
- Draft push
- Schedule
- Send

---

# APPENDIX J: ANALYTICS & REVENUE QUERIES

## Goal
Track **traffic, engagement, and monetization** clearly.

---

## Article Views
```sql
select article_id, count(*) as views
from analytics_events
where event_type = 'view'
group by article_id
order by views desc;
```

## Click-Through Rate (CTR)
```sql
select article_id,
  sum(case when event_type = 'click' then 1 else 0 end)::float /
  nullif(sum(case when event_type = 'view' then 1 else 0 end),0) as ctr
from analytics_events
group by article_id;
```

## Revenue Summary
```sql
select type, sum(amount) as total
from monetization_logs
group by type;
```

## Top Publishers
```sql
select p.name, count(a.id) as articles
from publishers p
join news_sources s on s.id = a.source_id
join news_articles a on a.source_id = s.id
group by p.name
order by articles desc;
```

---

# APPENDIX K: AI‑ASSISTED CONTENT QUALITY & FAKE‑NEWS DETECTION

## Goal
Automatically **flag suspicious or low-quality news** before wide distribution.

---

## Strategy (Lightweight & Safe)

Signals used:
- Excessive ALL CAPS
- Sensational keywords
- No known publisher
- Duplicate content
- Extreme sentiment

---

## Table
```sql
alter table news_articles
add column quality_score numeric default 1.0;
```

---

## Edge Function Logic

### Function Name
`content-quality-check`

### Flow
1. New article inserted
2. Score content
3. If score < threshold → flag

```ts
function scoreArticle(title: string, summary: string) {
  let score = 1;
  if (title === title.toUpperCase()) score -= 0.3;
  if (/(BREAKING|SHOCKING|YOU WON'T BELIEVE)/i.test(title)) score -= 0.2;
  if (summary.length < 50) score -= 0.2;
  return Math.max(score, 0);
}
```

Flagged articles are hidden until admin review.

---

## Why This Matters

- Protects platform credibility
- Reduces legal risk
- Improves advertiser trust
- Prepares for AI summarization later

---

**END OF PRD**

