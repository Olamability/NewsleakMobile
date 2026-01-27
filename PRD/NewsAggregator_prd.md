# Product Requirements Document (PRD)

## Product Name

News Aggregator Mobile App (Opera News–style)

## Version

v1.0

## Author

Ability

## Date

January 2026

---

## 1. Overview

The News Aggregator App is a mobile-first platform that curates, categorizes, and delivers real-time news from multiple trusted sources (blogs, media houses, RSS feeds, and APIs) into a single, personalized reading experience. The app aims to provide users with fast, reliable, and engaging access to news across categories such as Politics, Sports, Business, Technology, Entertainment, Health, and Lifestyle.

The product is inspired by platforms like **Opera News** and **Google News**, but optimized for scalability, regional content inclusion, and modern mobile UX using **React Native Expo** and **Supabase**.

---

## 2. Goals & Objectives

### Primary Goals

- Aggregate news from multiple sources in real time
- Deliver categorized and searchable news content
- Provide personalized reading experience
- Support bookmarking and content discovery
- Ensure scalability and performance

### Success Metrics (KPIs)

- Daily Active Users (DAU)
- Average session duration
- Articles read per user
- Bookmark usage rate
- Push notification open rate

---

## 3. Target Users

### User Types

1. **Anonymous Users**
   - Can read news
   - Can browse categories
   - No personalization

2. **Registered Users**
   - Bookmark articles
   - Follow categories & sources
   - Receive personalized notifications

3. **Admin Users**
   - Manage news sources
   - Moderate content
   - Feature or remove articles

---

## 4. Core Features

### 4.1 News Aggregation & Ingestion

**Description:**
Automatically fetch news from external sources.

**Sources:**

- RSS Feeds (BBC, Punch, CNN, Blogs)
- Public News APIs
- Manual Admin Posts (optional)

**Ingestion Process:**

- Scheduled Edge Functions (cron)
- Fetch feeds periodically
- Deduplicate articles
- Normalize content
- Store in database

---

### 4.2 Content Normalization

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

---

### 4.3 Categorization & Tagging

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

---

### 4.4 News Feed & Reading Experience

- Infinite scrolling feed
- Category-based feed
- Article preview cards
- Full article reader
- Source attribution and external link

---

### 4.5 Search

**Capabilities:**

- Search by title
- Search by keywords
- Filter by category

**Implementation Options:**

- PostgreSQL Full-Text Search (MVP)
- External search engine (future)

---

### 4.6 Bookmarking

- Save articles for later
- View bookmarks list
- Remove bookmarks

---

### 4.7 Personalization

- Follow categories
- Follow sources
- Language preference
- Reading history

---

### 4.8 Real-Time Updates

- Breaking news alerts
- Trending articles
- Live updates using Supabase Realtime

---

### 4.9 Notifications

- Push notifications via Expo
- Category-based alerts
- Breaking news alerts

---

## 5. Admin Dashboard

### Admin Capabilities

- Manage news sources (enable/disable)
- Edit categories and tags
- Review and remove articles
- Feature articles
- Monitor ingestion logs

---

## 6. Backend Architecture

### Technology Stack

**Frontend:**

- React Native Expo
- TypeScript
- TanStack Query

**Backend:**

- Supabase (Postgres)
- Supabase Auth
- Supabase Edge Functions
- Supabase Realtime

---

## 7. Database Design (High-Level)

### Core Tables

- news_articles
- news_sources
- categories
- tags
- article_tags
- users
- bookmarks
- reading_history

### Advanced Tables

- user_preferences
- user_interactions
- trending_articles

---

## 8. Security & Access Control

- Row Level Security (RLS)
- Public read-only access for articles
- Auth-required actions for bookmarks
- Admin-only write access

---

## 9. Performance & Scalability

- Pagination & infinite scroll
- Indexed queries
- Edge caching
- Image CDN
- Rate-limited ingestion

---

## 10. Legal & Compliance

- Respect RSS terms of use
- Always credit sources
- Link back to original articles
- Avoid scraping restricted content

---

## 11. Monetization (Future)

- In-feed ads
- Sponsored articles
- Affiliate links

---

## 12. Future Enhancements

- AI-generated summaries
- Offline reading
- Multi-language support
- Recommendation engine
- User-generated comments

---

## 13. Risks & Mitigation

| Risk                 | Mitigation                    |
| -------------------- | ----------------------------- |
| Duplicate content    | Deduplication logic           |
| Scaling issues       | Pagination & caching          |
| Legal issues         | Source compliance             |
| Poor personalization | Analytics-driven improvements |

---

## 14. MVP Scope

### Included

- News ingestion via RSS
- Categorized feed
- Search
- Bookmarking
- Push notifications

### Excluded

- Ads
- AI summaries
- Advanced analytics

---

## 15. Conclusion

This PRD outlines a scalable, production-ready news aggregation platform built with React Native Expo and Supabase. The architecture supports real-time content delivery, personalization, and future growth while remaining cost-effective and secure.

---
