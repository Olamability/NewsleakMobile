// Core type definitions for the News Aggregator App

export interface NewsArticle {
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

export interface NewsSource {
  id: string;
  name: string;
  rss_url?: string;
  website_url: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article?: NewsArticle;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preferred_categories?: string[];
  preferred_sources?: string[];
  language?: string;
  notification_enabled: boolean;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  article_id: string;
  read_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  full_name?: string;
}
