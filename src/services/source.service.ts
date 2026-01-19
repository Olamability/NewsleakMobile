import { supabase } from './supabase';
import { NewsSource, ApiResponse } from '../types';

export class SourceService {
  /**
   * Get all news sources
   * @returns Array of news sources. Returns empty array on error.
   */
  static async getSources(): Promise<NewsSource[]> {
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
      console.error('Error fetching sources:', error);
      return [];
    }
  }

  /**
   * Get active news sources
   * @returns Array of active news sources. Returns empty array on error.
   */
  static async getActiveSources(): Promise<NewsSource[]> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error: unknown) {
      console.error('Error fetching active sources:', error);
      return [];
    }
  }

  /**
   * Add a new news source
   */
  static async addSource(
    name: string,
    rssUrl: string,
    websiteUrl: string,
    logoUrl?: string
  ): Promise<ApiResponse<NewsSource>> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .insert([
          {
            name,
            rss_url: rssUrl,
            website_url: websiteUrl,
            logo_url: logoUrl,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Failed to add source' };
    }
  }

  /**
   * Update a news source
   */
  static async updateSource(
    id: string,
    updates: Partial<NewsSource>
  ): Promise<ApiResponse<NewsSource>> {
    try {
      const { data, error } = await supabase
        .from('news_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Failed to update source' };
    }
  }

  /**
   * Delete a news source
   */
  static async deleteSource(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('news_sources')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { message: 'Source deleted successfully' };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete source' };
    }
  }

  /**
   * Toggle source active status
   */
  static async toggleSource(id: string, isActive: boolean): Promise<ApiResponse<NewsSource>> {
    return this.updateSource(id, { is_active: isActive });
  }
}
