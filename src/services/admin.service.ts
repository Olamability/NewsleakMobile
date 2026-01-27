import { supabase } from './supabase';
import { NewsArticle, NewsSource, ApiResponse, PaginatedResponse, User } from '../types';
import { SourceService } from './source.service';

const ITEMS_PER_PAGE = 20;

export class AdminService {
  /**
   * Get all sources for admin management (including inactive)
   */
  static async getAllSources(): Promise<NewsSource[]> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching sources for admin:', error);
      return [];
    }
  }

  /**
   * Add a new news source
   */
  static async addSource(
    name: string,
    rssUrl: string,
    websiteUrl?: string
  ): Promise<ApiResponse<NewsSource>> {
    try {
      // Extract base domain from RSS URL if website URL not provided
      let finalWebsiteUrl = websiteUrl;
      if (!websiteUrl && rssUrl) {
        try {
          const url = new URL(rssUrl);
          // Use the base domain as website URL (e.g., https://example.com)
          finalWebsiteUrl = `${url.protocol}//${url.host}`;
        } catch {
          // Last resort: use RSS URL itself (not ideal but prevents empty field)
          finalWebsiteUrl = rssUrl;
        }
      }

      const { data, error } = await supabase
        .from('news_sources')
        .insert({
          name,
          rss_url: rssUrl,
          website_url: finalWebsiteUrl!,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data, message: 'Source added successfully' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add source';
      return { error: message };
    }
  }

  /**
   * Toggle source active status
   */
  static async toggleSourceStatus(
    sourceId: string,
    isActive: boolean
  ): Promise<ApiResponse<NewsSource>> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .update({ is_active: isActive })
        .eq('id', sourceId)
        .select()
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }

      if (!data) {
        return { error: 'Source not found' };
      }

      return { data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to toggle source status';
      return { error: message };
    }
  }

  /**
   * Delete a news source (delegates to SourceService)
   */
  static async deleteSource(sourceId: string): Promise<ApiResponse<void>> {
    return SourceService.deleteSource(sourceId);
  }

  /**
   * Get all articles for admin management with pagination
   */
  static async getAllArticles(
    page: number = 1,
    limit: number = ITEMS_PER_PAGE
  ): Promise<PaginatedResponse<NewsArticle>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact' })
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
    } catch (error: unknown) {
      console.error('Error fetching articles for admin:', error);
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
   * Toggle article featured status
   */
  static async toggleArticleFeaturedStatus(
    articleId: string,
    isFeatured: boolean
  ): Promise<ApiResponse<NewsArticle>> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .update({ is_featured: isFeatured })
        .eq('id', articleId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to toggle featured status';
      return { error: message };
    }
  }

  /**
   * Delete an article
   */
  static async deleteArticle(articleId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from('news_articles').delete().eq('id', articleId);

      if (error) {
        return { error: error.message };
      }

      return { message: 'Article deleted successfully' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete article';
      return { error: message };
    }
  }

  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(): Promise<{
    activeSources: number;
    totalArticles: number;
    totalUsers: number;
    featuredArticles: number;
  }> {
    try {
      // Get active sources count
      const { count: activeSources } = await supabase
        .from('news_sources')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total articles count
      const { count: totalArticles } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true });

      // Get featured articles count
      const { count: featuredArticles } = await supabase
        .from('news_articles')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true);

      // Try to get total users count (might fail if we don't have access)
      let totalUsers = 0;
      try {
        const result = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        totalUsers = (result.data as any)?.count || 0;
      } catch {
        // If we can't access admin API, just return 0
        totalUsers = 0;
      }

      return {
        activeSources: activeSources || 0,
        totalArticles: totalArticles || 0,
        totalUsers: totalUsers,
        featuredArticles: featuredArticles || 0,
      };
    } catch (error: unknown) {
      console.error('Error fetching dashboard stats:', error);
      return {
        activeSources: 0,
        totalArticles: 0,
        totalUsers: 0,
        featuredArticles: 0,
      };
    }
  }

  /**
   * Get all users (requires admin permissions)
   *
   * Note: This method requires proper Supabase admin setup.
   * For production, this should be moved to a backend service
   * that uses service role keys, not exposed in the mobile client.
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      // Note: This requires proper Supabase configuration with admin access
      // For now, return empty array as we need to set up proper user management table
      // In production, implement a backend API endpoint that uses service role
      console.warn('User management requires backend API with service role access');
      return [];
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Update article category
   */
  static async updateArticleCategory(
    articleId: string,
    category: string
  ): Promise<ApiResponse<NewsArticle>> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .update({ category })
        .eq('id', articleId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      return { error: message };
    }
  }

  /**
   * Update article details
   */
  static async updateArticle(
    articleId: string,
    updates: Partial<NewsArticle>
  ): Promise<ApiResponse<NewsArticle>> {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', articleId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update article';
      return { error: message };
    }
  }
}
