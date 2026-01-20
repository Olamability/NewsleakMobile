# NewsLeak Mobile - Architecture Overview

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Scalability Considerations](#scalability-considerations)

## System Architecture

NewsLeak Mobile is a production-grade, enterprise-level news aggregation platform built with React Native (Expo), TypeScript, and Supabase. The architecture follows clean architecture principles with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Presentation Layer (Screens)             │  │
│  │  Home | Categories | Search | Bookmarks | Profile    │  │
│  │  Admin Dashboard | Source Management | Articles       │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Component Layer                           │  │
│  │  NewsCard | FeaturedCard | Buttons | Inputs | Modals │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Service Layer                             │  │
│  │  Auth | News | RSS | Admin | Analytics | Offline     │  │
│  │  Monetization | Security | Credibility | Ingestion    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Utility Layer                             │  │
│  │  Validation | Security | Formatting | Scheduling      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Supabase)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Authentication (Supabase Auth)                      │  │
│  │   - Email/Password | OAuth | Session Management      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Database (PostgreSQL)                               │  │
│  │   - news_articles | news_sources | users              │  │
│  │   - bookmarks | reading_history | analytics           │  │
│  │   - subscriptions | security_logs                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Row-Level Security (RLS)                            │  │
│  │   - User-scoped data access                           │  │
│  │   - Admin permission checks                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                External RSS Feed Sources                     │
│   BBC | CNN | TechCrunch | The Guardian | Local News        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React Native 0.81.5 with Expo ~54.0
- **Language**: TypeScript 5.9
- **State Management**: React Context API
- **Navigation**: React Navigation 7.x
- **Storage**: AsyncStorage (offline cache), Expo SecureStore (credentials)
- **HTTP Client**: Axios
- **RSS Parsing**: rss-parser
- **Content Sanitization**: sanitize-html, cheerio

### Backend
- **BaaS**: Supabase (PostgreSQL + Auth + Realtime)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage (for future use)

### DevOps & Tools
- **Testing**: Jest + React Native Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Version Control**: Git + GitHub

## Core Components

### 1. Authentication System
- **Location**: `src/services/auth.service.ts`, `src/context/AuthContext.tsx`
- **Features**:
  - Email/password authentication
  - OAuth support (Google/Apple ready)
  - Role-based access control (admin/user)
  - Persistent login with secure token storage
  - Password reset functionality
  - Rate limiting (5 attempts/minute)

### 2. RSS Aggregation Engine
- **Location**: `src/services/rss.service.ts`, `src/services/ingestion.service.ts`
- **Features**:
  - Multi-source RSS feed parsing
  - Content normalization and cleaning
  - Duplicate detection (URL + content hash)
  - Image extraction and validation
  - Category inference
  - Retry logic with exponential backoff
  - Feed health monitoring

### 3. Content Pipeline
- **Location**: `src/services/content.service.ts`
- **Features**:
  - HTML sanitization (XSS prevention)
  - Metadata extraction
  - Slug generation
  - Category classification
  - Language detection
  - Image URL validation

### 4. Analytics System
- **Location**: `src/services/analytics.service.ts`
- **Features**:
  - Article view tracking
  - Reading session monitoring
  - Trending algorithm (views × recency × activity)
  - Breaking news detection
  - Smart recommendations
  - Source performance metrics
  - Reading time estimation

### 5. Offline Reading
- **Location**: `src/services/offline.service.ts`
- **Features**:
  - Article caching (max 50 articles)
  - Cache expiry management (7 days)
  - Automatic cleanup
  - Cache statistics
  - Prefetch capability

### 6. Credibility Scoring
- **Location**: `src/services/credibility.service.ts`
- **Features**:
  - Multi-factor credibility scoring
  - Source reliability metrics
  - Engagement scoring
  - Update frequency tracking
  - Category diversity analysis
  - Badge system (Highly Credible → Very Low Credibility)

### 7. Monetization Framework
- **Location**: `src/services/monetization.service.ts`
- **Features**:
  - Subscription tiers (Free, Premium, Pro)
  - Feature gating
  - Ad placement architecture (disabled by default)
  - Sponsored content tracking
  - Paywall configuration
  - Revenue-ready infrastructure

### 8. Security Layer
- **Location**: `src/services/security.service.ts`, `src/utils/security.ts`
- **Features**:
  - Rate limiting (configurable per endpoint)
  - Input sanitization (XSS prevention)
  - SQL injection prevention
  - Abuse detection
  - GDPR compliance (data export/deletion)
  - Security event logging
  - Suspicious activity detection

### 9. Admin Panel
- **Location**: `src/services/admin.service.ts`, `src/screens/Admin*.tsx`
- **Features**:
  - Source management (enable/disable)
  - Article moderation (feature/remove)
  - Dashboard statistics
  - Ingestion log monitoring
  - Real-time updates

## Data Flow

### Article Ingestion Flow
```
RSS Feed → Parse Feed → Normalize Content → Deduplicate → 
Sanitize HTML → Extract Metadata → Classify Category → 
Store in Database → Log Success/Failure
```

### User Reading Flow
```
Browse Articles → View Article → Track View → 
Start Reading Session → Track Duration → 
End Session → Update Analytics → 
Update Trending Score
```

### Recommendation Flow
```
Get User History → Extract Preferences → 
Analyze Categories/Sources → Query Similar Articles → 
Exclude Read Articles → Rank by Relevance → 
Return Recommendations
```

## Security Architecture

### Authentication
- Secure token storage in device keychain
- Session expiry and refresh
- Password complexity requirements
- Rate-limited login attempts

### Data Protection
- Row-level security in Supabase
- User-scoped data access
- Admin permission verification
- Input validation on all endpoints

### Privacy (GDPR)
- User data export functionality
- Data deletion requests
- Minimal PII logging
- Transparent data handling

### Rate Limiting
- Configurable per endpoint
- Token bucket algorithm
- Per-user and global limits
- Automatic cooldown

## Scalability Considerations

### Database Optimization
- Indexed columns: `published_at`, `category`, `source_id`, `is_featured`
- Pagination for all list queries
- Efficient query patterns (select specific fields)
- Connection pooling via Supabase

### Caching Strategy
- Client-side caching for offline reading
- Image URL caching
- Category/source list caching
- Analytics data aggregation

### Performance
- Lazy loading for article lists
- Image optimization
- Debounced search
- Efficient re-renders (React.memo)

### Future Scalability
- CDN for images and assets
- Read replicas for analytics queries
- Background job processing for ingestion
- Redis cache for trending/featured content
- GraphQL API for flexible queries
- Microservices for heavy workloads

## Database Schema (Core Tables)

### news_articles
```sql
- id (uuid, PK)
- title (text)
- slug (text, indexed)
- summary (text)
- content_snippet (text)
- image_url (text)
- article_url (text, unique)
- canonical_url (text)
- source_id (uuid, FK)
- source_name (text)
- category (text, indexed)
- published_at (timestamp, indexed)
- view_count (integer, default 0)
- is_featured (boolean, indexed)
- created_at (timestamp)
```

### news_sources
```sql
- id (uuid, PK)
- name (text)
- rss_url (text)
- website_url (text)
- logo_url (text)
- is_active (boolean, indexed)
- created_at (timestamp)
```

### users (via Supabase Auth)
```sql
- id (uuid, PK)
- email (text, unique)
- user_metadata (jsonb)
  - full_name
  - is_admin
  - avatar_url
```

### bookmarks
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- article_id (uuid, FK)
- created_at (timestamp)
```

### reading_history
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- article_id (uuid, FK)
- read_at (timestamp)
```

## API Endpoints (Service Methods)

### Authentication
- `AuthService.signUp(email, password, fullName)`
- `AuthService.signIn(email, password)`
- `AuthService.signOut()`
- `AuthService.resetPassword(email)`
- `AuthService.updateProfile(updates)`

### News
- `NewsService.getArticles(page, limit, category)`
- `NewsService.searchArticles(query, page, limit)`
- `NewsService.getFeaturedArticles(limit)`
- `NewsService.getTrendingArticles(limit)`
- `NewsService.incrementViewCount(articleId)`

### Admin
- `AdminService.getAllSources()`
- `AdminService.toggleSourceStatus(sourceId, isActive)`
- `AdminService.getAllArticles(page, limit)`
- `AdminService.toggleArticleFeaturedStatus(articleId, isFeatured)`
- `AdminService.deleteArticle(articleId)`
- `AdminService.getDashboardStats()`

### Analytics
- `AnalyticsService.trackArticleView(articleId, userId)`
- `AnalyticsService.startReadingSession(articleId, userId)`
- `AnalyticsService.endReadingSession(sessionId, scrollDepth)`
- `AnalyticsService.getTrendingArticles(limit)`
- `AnalyticsService.getBreakingNews(limit)`
- `AnalyticsService.getRecommendations(userId, limit)`

## Deployment

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_UTM_SOURCE=spazr_app
EXPO_PUBLIC_UTM_MEDIUM=referral
EXPO_PUBLIC_UTM_CAMPAIGN=news_aggregation
```

### Build Commands
```bash
# Development
npm start

# iOS
npm run ios

# Android
npm run android

# Production build (requires EAS)
eas build --platform ios
eas build --platform android
```

## Monitoring & Logging

### Error Tracking
- Console errors logged to analytics
- Crash reporting ready (can integrate Sentry)
- Security event logging

### Performance Metrics
- Article load times
- Feed ingestion success rate
- API response times
- Cache hit/miss rates

### Business Metrics
- Daily active users
- Article views
- Reading sessions
- Subscription conversions

## Future Enhancements

1. **Push Notifications**: Breaking news alerts
2. **Social Features**: Share articles, comments
3. **Multi-language Support**: i18n integration
4. **Video Content**: Video news integration
5. **Podcasts**: Audio news support
6. **Dark Mode Themes**: Multiple theme options
7. **Text-to-Speech**: Listen to articles
8. **AI Summarization**: Automatic article summaries
9. **Personalization**: ML-based recommendations
10. **Real-time Updates**: WebSocket for live news

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained By**: NewsLeak Mobile Team
