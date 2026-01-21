import { supabase } from './supabase';
import { Bookmark, NewsArticle, ApiResponse } from '../types';

export class BookmarkService {
  /**
   * Add an article to bookmarks
   */
  static async addBookmark(articleId: string): Promise<ApiResponse<Bookmark>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { error: 'User not authenticated' };
      }

      // Check if bookmark already exists
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (existing) {
        return { data: existing, message: 'Article already bookmarked' };
      }

      // Create new bookmark
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          article_id: articleId,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data, message: 'Article bookmarked successfully' };
    } catch (_error) {
      return { error: (_error as Error).message || 'Failed to add bookmark' };
    }
  }

  /**
   * Remove an article from bookmarks
   */
  static async removeBookmark(articleId: string): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) {
        return { error: error.message };
      }

      return { data: null, message: 'Bookmark removed successfully' };
    } catch (_error) {
      return { error: (_error as Error).message || 'Failed to remove bookmark' };
    }
  }

  /**
   * Get all bookmarks for the current user
   */
  static async getBookmarks(): Promise<NewsArticle[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select(
          `
          *,
          article:news_articles(
            *,
            news_sources(*)
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Extract articles from bookmarks and cast to NewsArticle
      return (data || []).map((bookmark: any) => bookmark.article).filter(Boolean) as NewsArticle[];
    } catch (_error) {
      console.error('Error fetching bookmarks:', _error);
      return [];
    }
  }

  /**
   * Check if an article is bookmarked
   */
  static async isBookmarked(articleId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      return !error && !!data;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get bookmark count for current user
   */
  static async getBookmarkCount(): Promise<number> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return 0;
      }

      const { count, error } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (_error) {
      console.error('Error getting bookmark count:', _error);
      return 0;
    }
  }
}
