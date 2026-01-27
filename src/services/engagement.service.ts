import { supabase } from './supabase';
import { ArticleComment } from '../types/news';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'app_device_id';

/**
 * Service for managing article engagement (likes and comments)
 */
export class EngagementService {
  /**
   * Get or generate a unique device identifier
   */
  private static async getDeviceId(): Promise<string> {
    try {
      // Try to get stored device ID
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!deviceId) {
        // Generate a unique device ID combining timestamp and random string
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 15);
        const deviceName = Device.deviceName || 'unknown';
        const modelName = Device.modelName || 'unknown';

        deviceId = `${deviceName}-${modelName}-${timestamp}-${random}`;

        // Store for future use
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to a temporary ID
      return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  /**
   * Toggle like on an article
   */
  static async toggleLike(articleId: string, userId?: string): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      // Check if already liked
      let query = supabase.from('article_likes').select('id').eq('article_id', articleId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('device_id', deviceId);
      }

      const { data: existingLike } = await query.maybeSingle();

      if (existingLike) {
        // Unlike - delete the like
        const deleteQuery = supabase.from('article_likes').delete().eq('article_id', articleId);

        if (userId) {
          deleteQuery.eq('user_id', userId);
        } else {
          deleteQuery.eq('device_id', deviceId);
        }

        const { error } = await deleteQuery;
        if (error) throw error;
        return false; // unliked
      } else {
        // Like - insert new like
        const { error } = await supabase.from('article_likes').insert({
          article_id: articleId,
          user_id: userId || null,
          device_id: userId ? null : deviceId,
        });

        if (error) throw error;
        return true; // liked
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Get like count for an article
   */
  static async getLikeCount(articleId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('article_likes')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting like count:', error);
      return 0;
    }
  }

  /**
   * Check if user/device has liked an article
   */
  static async isLiked(articleId: string, userId?: string): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId();

      let query = supabase.from('article_likes').select('id').eq('article_id', articleId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('device_id', deviceId);
      }

      const { data } = await query.maybeSingle();
      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get comment count for an article
   */
  static async getCommentCount(articleId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('article_comments')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', articleId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }

  /**
   * Get comments for an article
   */
  static async getComments(articleId: string): Promise<ArticleComment[]> {
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  /**
   * Add a comment to an article
   */
  static async addComment(
    articleId: string,
    content: string,
    userId?: string
  ): Promise<ArticleComment | null> {
    try {
      const deviceId = await this.getDeviceId();

      const { data, error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          content,
          user_id: userId || null,
          device_id: userId ? null : deviceId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  /**
   * Get engagement stats for multiple articles
   * Returns a map of article_id -> { likeCount, commentCount, isLiked }
   */
  static async getBulkEngagementStats(
    articleIds: string[],
    userId?: string
  ): Promise<Map<string, { likeCount: number; commentCount: number; isLiked: boolean }>> {
    try {
      const deviceId = await this.getDeviceId();
      const statsMap = new Map();

      // Get like counts
      const { data: likeCounts } = await supabase
        .from('article_likes')
        .select('article_id')
        .in('article_id', articleIds);

      // Count likes per article
      const likeCountMap = new Map<string, number>();
      likeCounts?.forEach((like) => {
        const count = likeCountMap.get(like.article_id) || 0;
        likeCountMap.set(like.article_id, count + 1);
      });

      // Get comment counts
      const { data: commentCounts } = await supabase
        .from('article_comments')
        .select('article_id')
        .in('article_id', articleIds);

      // Count comments per article
      const commentCountMap = new Map<string, number>();
      commentCounts?.forEach((comment) => {
        const count = commentCountMap.get(comment.article_id) || 0;
        commentCountMap.set(comment.article_id, count + 1);
      });

      // Check which articles are liked by current user/device
      let likedQuery = supabase
        .from('article_likes')
        .select('article_id')
        .in('article_id', articleIds);

      if (userId) {
        likedQuery = likedQuery.eq('user_id', userId);
      } else {
        likedQuery = likedQuery.eq('device_id', deviceId);
      }

      const { data: likedArticles } = await likedQuery;
      const likedSet = new Set(likedArticles?.map((l) => l.article_id) || []);

      // Build stats map
      articleIds.forEach((articleId) => {
        statsMap.set(articleId, {
          likeCount: likeCountMap.get(articleId) || 0,
          commentCount: commentCountMap.get(articleId) || 0,
          isLiked: likedSet.has(articleId),
        });
      });

      return statsMap;
    } catch (error) {
      console.error('Error getting bulk engagement stats:', error);
      return new Map();
    }
  }
}
