# Product Requirements Document (PRD)

## Product Name
**Spazr News Aggregator** (working name)

## Product Vision
To build a mobile-first news aggregator app that curates real-time news from trusted news websites and blogs, while **driving measurable traffic back to the original publishers**. The app should feel similar to Opera News / Google News but with clear source attribution and outbound links that benefit partner news sites.

This product directly supports your existing platforms (e.g. **spazr.com.ng**, **abilitydigitalz.com.ng**) and other Nigerian & global news publishers.

---

## Goals & Objectives

### Primary Goals
- Aggregate **real news content** from verified news websites (via RSS & scraping where allowed)
- Display news in a clean, fast, mobile-friendly app
- Redirect users to **original news sources** to read full articles
- Increase traffic, impressions, and SEO value for partner sites

### Secondary Goals
- Build a scalable backend that supports live updates
- Support multiple categories (Politics, Sports, Business, Entertainment, etc.)
- Prepare the app for monetization (ads, promoted stories, partnerships)

---

## Target Users

1. **News Readers**
   - Want fast access to trending and categorized news
   - Prefer summaries but want full articles when needed

2. **News Publishers / Blog Owners**
   - Want more traffic and visibility
   - Want their content featured without being stolen

---

## Key Value Proposition

- ❌ No copied content
- ✅ Proper attribution
- ✅ Click-through traffic to original sites
- ✅ Real-time updates
- ✅ Nigerian-focused + global expansion

---

## Core Features

### 1. News Aggregation (Real Data Only)

**Sources**:
- RSS feeds (Punch, Vanguard, BBC, CNN, etc.)
- Custom blogs (spazr.com.ng, abilitydigitalz.com.ng)

Ingestion Process:**
- Scheduled Edge Functions (cron)
- Fetch feeds periodically
- Deduplicate articles
- Normalize content
- Store in database

**Ingestion Rules**:
- Fetch title, excerpt, featured image, source, publish date
- Store clean text only (no embedded ads)
- Respect robots.txt & publisher policies

---

### 2. News Categories

- Top Stories
- Politics
- Business
- Sports
- Entertainment
- Technology
- Health
- Lifestyle

---

Admin Users**
   - Manage news sources
   - Moderate content
   - Feature or remove articles

### 3. Article Preview Screen

Each article card shows:
- Headline
- Featured image
- Source logo/name
- Short summary (2–4 lines)
- Time published

**CTA Button:**
> "Read Full Article" → Opens original publisher website

---

### 4. Traffic Redirection Strategy

- All full reads happen on **publisher websites**
- Use:
  - In-app browser (WebView)
  - Or external browser (user preference)
- Add UTM tracking parameters for analytics

Example:
```
https://publisher.com/article-title?utm_source=spazr_app&utm_medium=referral
```

---

### 5. Search & Discoverability

- Keyword-based search
- Trending topics
- Recent breaking news

---

### 6. Notifications (Phase 2)

- Breaking news alerts
- Category-based subscriptions
Push notifications via Expo
- Category-based alerts

---

### 7. Optional User Accounts (Phase 2)

- Bookmark articles
- Follow sources
- Save reading history
Save articles for later
- View bookmarks list
- Remove bookmarks

(Authentication not required for basic usage)

---

## Non-Goals (Out of Scope Initially)

- Writing original news content
- Paywalled content scraping
- Social media-style comments (Phase 3)

---

## Technical Architecture

### Frontend (Mobile App)

**Stack**:
- React Native (Expo)
- TypeScript
- React Navigation

**Screens**:
- Splash Screen
- Home (Top Stories)
- Category Screen
- Article Preview
- WebView (Read Full Article)
- Search
- Settings

---

### Backend (Production-Grade)

**Stack**:
- Supabase (PostgreSQL + Auth + Storage)
- Node.js / TypeScript
- Cron jobs / scheduled functions

---

### Database Schema (Simplified)

**news_articles**
- id (uuid)
- title
- summary
- content_snippet
- image_url
- source_name
- source_url
- article_url
- category
- published_at
- created_at

**news_sources**
- id
- name
- rss_url
- website_url
- logo_url
- is_active

---

### News Ingestion Pipeline

1. Cron job runs every 10–30 minutes
2. Fetch RSS feeds
3. Parse & sanitize content
4. Remove duplicates
5. Categorize article
6. Store in database
7. Serve via API

---

### API Layer

- `GET /news`
- `GET /news?category=sports`
- `GET /news/search?q=keyword`
- `GET /sources`

---

## Content Legality & Ethics

- Only use public RSS feeds
- No full article reproduction
- Clear source attribution
- Immediate redirect to original source

(This protects you legally and builds publisher trust)

---

## Analytics & Tracking

- Click-through rate per source
- Most-read categories
- Daily active users
- Referral traffic stats for publishers

Tools:
- Firebase Analytics
- Supabase logs
- Google Analytics (UTM)

---

## Monetization Strategy (Future)

- Google AdMob
- Sponsored placements
- Featured publisher slots
- Affiliate links (where applicable)

---

## Development Phases

### Phase 1 – MVP (4–6 weeks)
- Backend setup
- RSS ingestion
- Mobile app core screens
- Article redirection

### Phase 2 – Growth
- Notifications
- Search improvements
- User bookmarks

### Phase 3 – Scale
- Publisher dashboard
- Advanced analytics
- iOS release

---

## Deployment & Production

- Backend: Supabase + Node server
- Mobile App:
  - Android: Google Play Store
  - iOS: Apple App Store

---

## Risks & Mitigation

| Risk | Mitigation |
|----|----|
| Publisher complaints | Strict attribution & redirects |
| Duplicate content | Hash-based detection |
| Performance | Caching + pagination |

---

## Success Metrics

- Daily active users (DAU)
- Click-through rate to publishers
- Session duration
- Retention rate

---

## Final Notes

This project aligns perfectly with your existing news platforms and can act as a **traffic engine** rather than a competitor to publishers.

---

## System Architecture Diagram (Textual)

### High-Level Architecture Flow

Mobile App (React Native / Expo)
↓
API Layer (Node.js / TypeScript)
↓
Supabase Backend
- PostgreSQL (news_articles, news_sources)
- Auth (optional users)
- Storage (logos, images if cached)
↓
RSS Ingestion Service (Cron Jobs)
↓
External News Sources (RSS Feeds)

### Detailed Flow
1. Cron job triggers RSS ingestion every 15–30 minutes
2. RSS feeds are fetched from verified news sources
3. Articles are parsed, cleaned, deduplicated
4. Only summaries/snippets are stored
5. Mobile app requests news via REST API
6. User taps "Read Full Article"
7. App opens original publisher URL with UTM tracking

---

## Backend Implementation (Real Data – No Mocking)

### Backend Folder Structure

```
backend/
├── src/
│   ├── ingest/
│   │   └── rssIngest.ts
│   ├── api/
│   │   └── newsRoutes.ts
│   ├── utils/
│   │   └── rssParser.ts
│   ├── db.ts
│   └── server.ts
├── package.json
└── .env
```

---

### RSS Ingestion Logic (Node.js + TypeScript)

**rssIngest.ts (Core Logic)**

- Fetch RSS feed URLs from `news_sources` table
- Parse XML using rss-parser
- Clean HTML
- Generate content hash to prevent duplicates
- Insert into `news_articles`

Key rules:
- Store only title, summary, image, source, link
- Never store full article body

---

### API Endpoints (Production)

- `GET /api/news`
- `GET /api/news?category=politics`
- `GET /api/news/search?q=lagos`
- `GET /api/sources`

All endpoints are paginated and cached.

---

## Mobile App – Google Play Ready Specification

### App Stack

- React Native (Expo)
- TypeScript
- Axios
- React Navigation
- Expo WebView

---

### Required Screens (MVP)

1. Splash Screen (3–4 seconds)
2. Home (Top Stories)
3. Category Screen
4. Article Preview Screen
5. WebView Screen (Read Full Article)
6. Search Screen
7. Settings Screen

---

### Google Play Store Compliance

- Privacy Policy (Required)
- Clear attribution to publishers
- No misleading content
- No copied articles

---

### App Permissions

- Internet access
- Notifications (optional)

---

### Release Checklist

- App icon & screenshots
- Signed APK / AAB
- Privacy Policy URL
- Content disclaimer

---

### Traffic Attribution

All external links append:

```
?utm_source=spazr_app&utm_medium=referral&utm_campaign=news_aggregation
```

---
Admin Dashboard

### Admin Capabilities
- Manage news sources (enable/disable)
- Edit categories and tags
- Review and remove articles
- Feature articles
- Monitor ingestion logs

Real-Time Updates

- Breaking news alerts
- Trending articles
- Live updates using Supabase

Personalization

- Follow categories
- Follow sources
- Language preference
- Reading history

News Feed & Reading Experience

- Infinite scrolling feed
- Category-based feed
- Article preview cards
- Full article reader
- Source attribution and external link

Content Normalization

All articles must conform to a unified schema:

- Title
- Slug
- Body / Content
- Excerpt
- Featured Image URL
- Source Name
- Source URL
- Category
- Tags
- Language
- Published Date

Categorization & Tagging

**Methods:**
- RSS category mapping
- Keyword-based classification
- Optional AI-based tagging (future)

**Default Categories:**
- Breaking News
- Politics
- Sports
- Business
- Technology
- Entertainment
- Health
- Lifestyle

**Status:** Ready for Development 🚀

