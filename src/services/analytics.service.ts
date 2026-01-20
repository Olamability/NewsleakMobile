import { supabase } from './supabase';
import { NewsArticle } from '../types';

export interface ArticleAnalytics {
  article_id: string;
  views: number;
  reads: number;
  avg_read_duration_seconds: number;
  last_viewed_at: string;
  trending_score: number;
}

export interface ReadingSession {
  id?: string;
  user_id?: string;
  article_id: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  scroll_depth_percent?: number;
}

export class AnalyticsService {
  /**
   * Track article view
   */
  static async trackArticleView(articleId: string, userId?: string): Promise<void> {
    try {
      // Increment view count
      const { data: article } = await supabase
        .from('news_articles')
        .select('view_count')
        .eq('id', articleId)
        .single();

      if (article) {
        await supabase
          .from('news_articles')
          .update({ 
            view_count: (article.view_count || 0) + 1,
            last_viewed_at: new Date().toISOString()
          })
          .eq('id', articleId);
      }

      // Track in analytics table if it exists
      try {
        await supabase.from('article_analytics').upsert({
          article_id: articleId,
          views: 1,
          last_viewed_at: new Date().toISOString(),
        }, {
          onConflict: 'article_id',
          ignoreDuplicates: false,
        });
      } catch {
        // Analytics table might not exist, that's okay
      }
    } catch (error) {
      console.error('Error tracking article view:', error);
    }
  }

  /**
   * Start reading session
   */
  static async startReadingSession(
    articleId: string,
    userId?: string
  ): Promise<string | null> {
    try {
      const session: ReadingSession = {
        article_id: articleId,
        user_id: userId,
        started_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('reading_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;

      return data?.id || null;
    } catch (error) {
      console.error('Error starting reading session:', error);
      return null;
    }
  }

  /**
   * End reading session and calculate duration
   */
  static async endReadingSession(
    sessionId: string,
    scrollDepthPercent?: number
  ): Promise<void> {
    try {
      const { data: session } = await supabase
        .from('reading_sessions')
        .select('started_at, article_id')
        .eq('id', sessionId)
        .single();

      if (session) {
        const startedAt = new Date(session.started_at);
        const completedAt = new Date();
        const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('reading_sessions')
          .update({
            completed_at: completedAt.toISOString(),
            duration_seconds: durationSeconds,
            scroll_depth_percent: scrollDepthPercent,
          })
          .eq('id', sessionId);

        // Update article analytics
        this.updateArticleReadMetrics(session.article_id, durationSeconds);
      }
    } catch (error) {
      console.error('Error ending reading session:', error);
    }
  }

  /**
   * Update article read metrics
   */
  private static async updateArticleReadMetrics(
    articleId: string,
    durationSeconds: number
  ): Promise<void> {
    try {
      // Get current analytics
      const { data: analytics } = await supabase
        .from('article_analytics')
        .select('*')
        .eq('article_id', articleId)
        .single();

      if (analytics) {
        const newReads = (analytics.reads || 0) + 1;
        const currentAvgDuration = analytics.avg_read_duration_seconds || 0;
        const newAvgDuration =
          (currentAvgDuration * (newReads - 1) + durationSeconds) / newReads;

        await supabase
          .from('article_analytics')
          .update({
            reads: newReads,
            avg_read_duration_seconds: Math.round(newAvgDuration),
          })
          .eq('article_id', articleId);
      }
    } catch (error) {
      console.error('Error updating article read metrics:', error);
    }
  }

  /**
   * Calculate trending score based on views and recency
   */
  static calculateTrendingScore(
    viewCount: number,
    publishedAt: string,
    lastViewedAt?: string
  ): number {
    const now = new Date();
    const publishDate = new Date(publishedAt);
    const hoursSincePublish = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60);

    // Recent articles get a boost
    const recencyFactor = hoursSincePublish < 24 ? 2 : hoursSincePublish < 48 ? 1.5 : 1;

    // Views in last 24 hours get higher weight
    let recentViewBoost = 1;
    if (lastViewedAt) {
      const lastViewDate = new Date(lastViewedAt);
      const hoursSinceLastView = (now.getTime() - lastViewDate.getTime()) / (1000 * 60 * 60);
      recentViewBoost = hoursSinceLastView < 24 ? 3 : hoursSinceLastView < 48 ? 2 : 1;
    }

    // Trending score formula: views * recency * recent activity
    return Math.round(viewCount * recencyFactor * recentViewBoost);
  }

  /**
   * Get trending articles based on view patterns
   */
  static async getTrendingArticles(limit: number = 10): Promise<NewsArticle[]> {
    try {
      // Get articles from last 7 days with views
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .gte('published_at', sevenDaysAgo.toISOString())
        .order('view_count', { ascending: false })
        .limit(limit * 2); // Get more to calculate trending score

      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Calculate trending scores and sort
      const articlesWithScores = data.map((article) => ({
        ...article,
        trending_score: this.calculateTrendingScore(
          article.view_count || 0,
          article.published_at,
          article.last_viewed_at
        ),
      }));

      // Sort by trending score and return top articles
      articlesWithScores.sort((a, b) => b.trending_score - a.trending_score);

      return articlesWithScores.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  /**
   * Detect breaking news based on rapid view growth
   */
  static async getBreakingNews(limit: number = 5): Promise<NewsArticle[]> {
    try {
      // Get very recent articles (last 6 hours) with high view counts
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .gte('published_at', sixHoursAgo.toISOString())
        .gte('view_count', 10) // Minimum threshold
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      return [];
    }
  }

  /**
   * Get personalized recommendations based on reading history
   */
  static async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<NewsArticle[]> {
    try {
      // Get user's reading history
      const { data: history } = await supabase
        .from('reading_history')
        .select('article_id')
        .eq('user_id', userId)
        .order('read_at', { ascending: false })
        .limit(20);

      if (!history || history.length === 0) {
        // No history, return trending articles
        return this.getTrendingArticles(limit);
      }

      // Get articles user has read
      const readArticleIds = history.map((h) => h.article_id);
      const { data: readArticles } = await supabase
        .from('news_articles')
        .select('category, source_name')
        .in('id', readArticleIds);

      if (!readArticles || readArticles.length === 0) {
        return this.getTrendingArticles(limit);
      }

      // Extract preferred categories and sources
      const categoryCount: Record<string, number> = {};
      const sourceCount: Record<string, number> = {};

      readArticles.forEach((article) => {
        categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
        sourceCount[article.source_name] = (sourceCount[article.source_name] || 0) + 1;
      });

      // Get top categories and sources
      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((e) => e[0]);

      const topSources = Object.entries(sourceCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((e) => e[0]);

      // Get recommended articles from preferred categories/sources
      // that user hasn't read yet
      const { data: recommendations, error } = await supabase
        .from('news_articles')
        .select('*')
        .not('id', 'in', `(${readArticleIds.join(',')})`)
        .or(
          `category.in.(${topCategories.join(',')}),source_name.in.(${topSources.join(',')})`
        )
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return recommendations || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Fallback to trending
      return this.getTrendingArticles(limit);
    }
  }

  /**
   * Estimate reading time based on content length
   */
  static estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    // Count words
    const wordCount = plainText.trim().split(/\s+/).length;
    // Calculate minutes (minimum 1 minute)
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Track click-through rate
   */
  static async trackClick(
    articleId: string,
    clickType: 'article_view' | 'external_link' | 'share',
    userId?: string
  ): Promise<void> {
    try {
      await supabase.from('click_tracking').insert([
        {
          article_id: articleId,
          user_id: userId,
          click_type: clickType,
          clicked_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  /**
   * Get source performance metrics
   */
  static async getSourceMetrics(sourceId: string): Promise<{
    totalArticles: number;
    totalViews: number;
    avgViewsPerArticle: number;
    avgReadDuration: number;
  }> {
    try {
      const { data: articles } = await supabase
        .from('news_articles')
        .select('view_count')
        .eq('source_id', sourceId);

      if (!articles || articles.length === 0) {
        return {
          totalArticles: 0,
          totalViews: 0,
          avgViewsPerArticle: 0,
          avgReadDuration: 0,
        };
      }

      const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
      const avgViews = Math.round(totalViews / articles.length);

      return {
        totalArticles: articles.length,
        totalViews,
        avgViewsPerArticle: avgViews,
        avgReadDuration: 0, // Would need to query reading_sessions
      };
    } catch (error) {
      console.error('Error getting source metrics:', error);
      return {
        totalArticles: 0,
        totalViews: 0,
        avgViewsPerArticle: 0,
        avgReadDuration: 0,
      };
    }
  }
}
