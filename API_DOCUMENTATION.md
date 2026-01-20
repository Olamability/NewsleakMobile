# NewsLeak Mobile - API Documentation

## Table of Contents
1. [Authentication API](#authentication-api)
2. [News API](#news-api)
3. [Admin API](#admin-api)
4. [Analytics API](#analytics-api)
5. [Offline API](#offline-api)
6. [Security API](#security-api)
7. [Monetization API](#monetization-api)
8. [Error Handling](#error-handling)

---

## Authentication API

### AuthService

All authentication methods return `Promise<ApiResponse<T>>` where T is the expected data type.

#### Sign Up
```typescript
AuthService.signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<ApiResponse<User>>
```

**Parameters:**
- `email`: Valid email address (validated)
- `password`: Minimum 8 characters with letters and numbers
- `fullName`: Optional display name

**Returns:**
```typescript
{
  data?: {
    id: string;
    email: string;
    full_name?: string;
    is_admin: boolean;
  };
  error?: string;
}
```

**Rate Limit:** 5 requests per minute per IP

---

#### Sign In
```typescript
AuthService.signIn(
  email: string,
  password: string
): Promise<ApiResponse<{ user: User; session: Session }>>
```

**Parameters:**
- `email`: User email
- `password`: User password

**Returns:**
```typescript
{
  data?: {
    user: User;
    session: Session;
  };
  error?: string;
}
```

**Rate Limit:** 5 requests per minute per IP

---

#### Sign Out
```typescript
AuthService.signOut(): Promise<ApiResponse<void>>
```

**Returns:**
```typescript
{
  error?: string;
  message?: string; // "Signed out successfully"
}
```

---

#### Reset Password
```typescript
AuthService.resetPassword(email: string): Promise<ApiResponse<void>>
```

**Parameters:**
- `email`: Email address to send reset link

**Returns:**
```typescript
{
  message?: string;
  error?: string;
}
```

---

## News API

### NewsService

#### Get Articles
```typescript
NewsService.getArticles(
  page: number = 1,
  limit: number = 20,
  category?: string
): Promise<PaginatedResponse<NewsArticle>>
```

**Parameters:**
- `page`: Page number (1-indexed)
- `limit`: Articles per page (max 100)
- `category`: Optional category filter

**Returns:**
```typescript
{
  data: NewsArticle[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
```

---

#### Search Articles
```typescript
NewsService.searchArticles(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<NewsArticle>>
```

**Parameters:**
- `query`: Search term (min 2 characters)
- `page`: Page number
- `limit`: Results per page

**Returns:** Same as `getArticles`

**Rate Limit:** 20 requests per minute per user

---

#### Get Featured Articles
```typescript
NewsService.getFeaturedArticles(
  limit: number = 5
): Promise<NewsArticle[]>
```

**Returns:** Array of featured articles

---

#### Get Trending Articles
```typescript
NewsService.getTrendingArticles(
  limit: number = 10
): Promise<NewsArticle[]>
```

**Returns:** Array of trending articles based on view patterns

---

#### Increment View Count
```typescript
NewsService.incrementViewCount(
  articleId: string
): Promise<void>
```

**Side Effects:** Updates article view_count and last_viewed_at

---

## Admin API

### AdminService

**Note:** All admin methods require admin permissions

#### Get All Sources
```typescript
AdminService.getAllSources(): Promise<NewsSource[]>
```

**Returns:** Array of all news sources (including inactive)

**Required Permission:** `is_admin: true`

---

#### Toggle Source Status
```typescript
AdminService.toggleSourceStatus(
  sourceId: string,
  isActive: boolean
): Promise<ApiResponse<NewsSource>>
```

**Parameters:**
- `sourceId`: UUID of the source
- `isActive`: New active status

**Returns:**
```typescript
{
  data?: NewsSource;
  error?: string;
}
```

---

#### Get All Articles (Admin)
```typescript
AdminService.getAllArticles(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<NewsArticle>>
```

**Returns:** Paginated list of all articles

---

#### Toggle Article Featured Status
```typescript
AdminService.toggleArticleFeaturedStatus(
  articleId: string,
  isFeatured: boolean
): Promise<ApiResponse<NewsArticle>>
```

**Parameters:**
- `articleId`: UUID of the article
- `isFeatured`: New featured status

---

#### Delete Article
```typescript
AdminService.deleteArticle(
  articleId: string
): Promise<ApiResponse<void>>
```

**Returns:**
```typescript
{
  message?: string; // "Article deleted successfully"
  error?: string;
}
```

---

#### Get Dashboard Stats
```typescript
AdminService.getDashboardStats(): Promise<{
  activeSources: number;
  totalArticles: number;
  totalUsers: number;
  featuredArticles: number;
}>
```

**Returns:** Admin dashboard statistics

---

## Analytics API

### AnalyticsService

#### Track Article View
```typescript
AnalyticsService.trackArticleView(
  articleId: string,
  userId?: string
): Promise<void>
```

**Side Effects:**
- Increments article view count
- Updates last_viewed_at timestamp
- Creates analytics record

---

#### Start Reading Session
```typescript
AnalyticsService.startReadingSession(
  articleId: string,
  userId?: string
): Promise<string | null>
```

**Returns:** Session ID for tracking duration

---

#### End Reading Session
```typescript
AnalyticsService.endReadingSession(
  sessionId: string,
  scrollDepthPercent?: number
): Promise<void>
```

**Parameters:**
- `sessionId`: ID from startReadingSession
- `scrollDepthPercent`: How far user scrolled (0-100)

---

#### Get Trending Articles
```typescript
AnalyticsService.getTrendingArticles(
  limit: number = 10
): Promise<NewsArticle[]>
```

**Algorithm:**
```
trending_score = views × recency_factor × recent_activity_boost
- Articles < 24hrs old: 2x boost
- Articles < 48hrs old: 1.5x boost
- Recent views < 24hrs: 3x boost
- Recent views < 48hrs: 2x boost
```

---

#### Get Breaking News
```typescript
AnalyticsService.getBreakingNews(
  limit: number = 5
): Promise<NewsArticle[]>
```

**Criteria:**
- Published within last 6 hours
- Minimum 10 views
- Sorted by view count

---

#### Get Recommendations
```typescript
AnalyticsService.getRecommendations(
  userId: string,
  limit: number = 10
): Promise<NewsArticle[]>
```

**Algorithm:**
1. Analyze user's last 20 read articles
2. Extract top 3 categories and sources
3. Find unread articles from preferred categories/sources
4. Sort by recency
5. Fallback to trending if no history

---

#### Estimate Reading Time
```typescript
AnalyticsService.estimateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number
```

**Returns:** Estimated minutes to read (minimum 1)

---

## Offline API

### OfflineService

#### Cache Article
```typescript
OfflineService.cacheArticle(
  article: NewsArticle
): Promise<boolean>
```

**Constraints:**
- Max 50 cached articles
- 7-day expiry
- Auto-cleanup of old cache

---

#### Get Cached Article
```typescript
OfflineService.getCachedArticle(
  articleId: string
): Promise<CachedArticle | null>
```

**Returns:** Cached article or null if expired/not found

---

#### Get All Cached Articles
```typescript
OfflineService.getAllCachedArticles(): Promise<CachedArticle[]>
```

---

#### Is Article Cached
```typescript
OfflineService.isArticleCached(
  articleId: string
): Promise<boolean>
```

---

#### Clear All Cache
```typescript
OfflineService.clearAllCache(): Promise<void>
```

---

#### Get Cache Stats
```typescript
OfflineService.getCacheStats(): Promise<{
  totalArticles: number;
  totalSizeBytes: number;
  oldestCachedAt: string | null;
  newestCachedAt: string | null;
}>
```

---

## Security API

### SecurityService

#### Log Security Event
```typescript
SecurityService.logSecurityEvent(
  event: SecurityLog
): Promise<void>
```

**Event Types:**
- `login`
- `logout`
- `failed_login`
- `suspicious_activity`
- `data_access`
- `data_deletion`

---

#### Detect Suspicious Activity
```typescript
SecurityService.detectSuspiciousActivity(
  userId: string,
  ipAddress?: string
): Promise<boolean>
```

**Flags:**
- 5+ failed logins in 1 hour
- Logins from 3+ IPs in 1 hour

---

#### Request Data Deletion (GDPR)
```typescript
SecurityService.requestDataDeletion(
  userId: string,
  requestType: 'account_deletion' | 'data_export' | 'data_deletion'
): Promise<{ success: boolean; requestId?: string; error?: string }>
```

---

#### Export User Data (GDPR)
```typescript
SecurityService.exportUserData(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }>
```

**Returns:** All user data (bookmarks, history, preferences, subscription)

---

#### Validate API Request
```typescript
SecurityService.validateApiRequest(
  userId: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMinutes: number = 1
): { allowed: boolean; remaining?: number; resetAt?: Date }
```

---

## Monetization API

### MonetizationService

#### Get User Subscription
```typescript
MonetizationService.getUserSubscription(
  userId: string
): Promise<UserSubscription | null>
```

**Returns:**
```typescript
{
  user_id: string;
  tier: 'free' | 'premium' | 'pro';
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  auto_renew: boolean;
}
```

---

#### Has Feature Access
```typescript
MonetizationService.hasFeatureAccess(
  userId: string,
  featureName: string
): Promise<boolean>
```

**Features:**
- `unlimited_bookmarks` (free)
- `offline_reading` (premium)
- `ad_free_experience` (premium)
- `smart_recommendations` (premium)
- `priority_support` (pro)
- `custom_categories` (pro)
- `export_articles` (pro)

---

#### Should Show Ad
```typescript
MonetizationService.shouldShowAd(
  userId: string,
  position: 'home_feed' | 'article_detail' | 'category_feed' | 'search_results'
): Promise<boolean>
```

---

#### Get Subscription Tiers
```typescript
MonetizationService.getSubscriptionTiers(): Array<{
  tier: SubscriptionTier;
  name: string;
  price: string;
  features: string[];
}>
```

---

## Error Handling

### ApiResponse Type
```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
```

### Common Error Codes

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Invalid email format" | Email validation failed | Provide valid email |
| "Password must be at least 8 characters" | Weak password | Use stronger password |
| "Rate limit exceeded" | Too many requests | Wait before retrying |
| "Unauthorized" | Missing/invalid token | Sign in again |
| "Forbidden" | Insufficient permissions | Check admin status |
| "Not found" | Resource doesn't exist | Verify ID |
| "Network error" | Connection failed | Check internet |

### Error Handling Pattern
```typescript
const response = await NewsService.getArticles(1, 20);

if (response.error) {
  // Handle error
  Alert.alert('Error', response.error);
} else {
  // Use data
  setArticles(response.data);
}
```

### Rate Limit Headers (Conceptual)
```typescript
{
  allowed: boolean;
  remaining?: number;
  resetAt?: Date;
}
```

---

## Type Definitions

### NewsArticle
```typescript
interface NewsArticle {
  id: string;
  title: string;
  slug?: string;
  summary: string;
  content_snippet?: string;
  image_url: string;
  source_name: string;
  source_url: string;
  article_url: string;
  category: string;
  tags?: string[];
  language?: string;
  published_at: string;
  created_at: string;
  is_featured?: boolean;
  view_count?: number;
}
```

### NewsSource
```typescript
interface NewsSource {
  id: string;
  name: string;
  rss_url?: string;
  website_url: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at: string;
}
```

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Base URL**: N/A (Client-side services using Supabase)
