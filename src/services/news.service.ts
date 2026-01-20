import { supabase } from './supabase';
import { NewsArticle, PaginatedResponse, ApiResponse } from '../types';
import { sanitizeSearchQuery, validateSearchQuery, sanitizeUrl } from '../utils/validation';
import { checkRateLimit } from '../utils/security';

const ITEMS_PER_PAGE = 20;

export class NewsService {
  /**
   * Fetch paginated news articles
   */
  static async getArticles(
    page: number = 1,
    limit: number = ITEMS_PER_PAGE,
    category?: string
  ): Promise<PaginatedResponse<NewsArticle>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .order('published_at', { ascending: false })
        .range(from, to);

      // Filter by category if provided
      if (category && category !== 'top-stories') {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      return {
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Get a single article by ID
   */
  static async getArticleById(id: string): Promise<ApiResponse<NewsArticle>> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch article' };
    }
  }

  /**
   * Search articles by keyword
   */
  static async searchArticles(
    query: string,
    page: number = 1,
    limit: number = ITEMS_PER_PAGE
  ): Promise<PaginatedResponse<NewsArticle>> {
    try {
      const queryValidation = validateSearchQuery(query);
      if (!queryValidation.isValid) {
        console.error('Invalid search query:', queryValidation.error);
        return {
          data: [],
          page,
          limit,
          total: 0,
          hasMore: false,
        };
      }

      const rateLimit = checkRateLimit('search', 'search');
      if (!rateLimit.allowed) {
        console.error('Rate limit exceeded for search');
        return {
          data: [],
          page,
          limit,
          total: 0,
          hasMore: false,
        };
      }

      const sanitizedQuery = sanitizeSearchQuery(query);
      if (!sanitizedQuery) {
        return {
          data: [],
          page,
          limit,
          total: 0,
          hasMore: false,
        };
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Search in title and summary
      const { data, error, count } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${sanitizedQuery}%,summary.ilike.%${sanitizedQuery}%`)
        .order('published_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    } catch (error: any) {
      console.error('Error searching articles:', error);
      return {
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false,
      };
    }
  }

  /**
   * Get featured articles
   */
  static async getFeaturedArticles(limit: number = 5): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching featured articles:', error);
      return [];
    }
  }

  /**
   * Get trending articles (most viewed)
   */
  static async getTrendingArticles(limit: number = 10): Promise<NewsArticle[]> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  /**
   * Increment article view count
   */
  static async incrementViewCount(articleId: string): Promise<void> {
    try {
      // First get current view count
      const { data: article } = await supabase
        .from('news_articles')
        .select('view_count')
        .eq('id', articleId)
        .single();

      if (article) {
        // Increment view count
        await supabase
          .from('news_articles')
          .update({ view_count: (article.view_count || 0) + 1 })
          .eq('id', articleId);
      }
    } catch (error: any) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get articles by category
   */
  static async getArticlesByCategory(
    category: string,
    page: number = 1,
    limit: number = ITEMS_PER_PAGE
  ): Promise<PaginatedResponse<NewsArticle>> {
    return this.getArticles(page, limit, category);
  }

  /**
   * Generate article URL with UTM parameters
   */
  static generateTrackingUrl(articleUrl: string): string {
    const sanitized = sanitizeUrl(articleUrl);
    if (!sanitized) {
      return articleUrl;
    }

    try {
      const utmSource = process.env.EXPO_PUBLIC_UTM_SOURCE || 'spazr_app';
      const utmMedium = process.env.EXPO_PUBLIC_UTM_MEDIUM || 'referral';
      const utmCampaign = process.env.EXPO_PUBLIC_UTM_CAMPAIGN || 'news_aggregation';

      const url = new URL(sanitized);
      url.searchParams.append('utm_source', utmSource);
      url.searchParams.append('utm_medium', utmMedium);
      url.searchParams.append('utm_campaign', utmCampaign);

      return url.toString();
    } catch {
      return articleUrl;
    }
  }
}
