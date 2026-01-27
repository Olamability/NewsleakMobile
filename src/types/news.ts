export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface NewsSource {
  id: string;
  name: string;
  website_url: string;
  rss_url: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  source_id: string;
  category_id?: string;
  title: string;
  summary: string;
  image_url?: string;
  original_url: string;
  published_at: string;
  is_breaking: boolean;
  is_sponsored: boolean;
  quality_score?: number;
  created_at: string;
  news_sources?: NewsSource;
  categories?: Category;
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

export interface SponsoredContent {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  cta_url: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  is_active: boolean;
  created_at: string;
}

export interface UserDevice {
  id: string;
  user_id?: string;
  expo_push_token: string;
  platform?: string;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  article_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  search_count: number;
  last_searched_at: string;
  created_at: string;
}

export interface RecentSearch {
  id: string;
  user_id?: string;
  query: string;
  created_at: string;
}

export interface ArticleLike {
  id: string;
  article_id: string;
  user_id?: string;
  device_id?: string;
  created_at: string;
}

export interface ArticleComment {
  id: string;
  article_id: string;
  user_id?: string;
  device_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type FeedItem = NewsArticle | SponsoredContent;

export interface FeedItemWithType extends NewsArticle {
  item_type: 'article' | 'sponsored';
}
