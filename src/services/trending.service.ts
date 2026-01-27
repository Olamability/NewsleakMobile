import { supabase } from './supabase';
import { NewsArticle } from '../types/news';

interface TrendingScore {
  articleId: string;
  score: number;
  views: number;
  likes: number;
  comments: number;
  recency: number;
}

/**
 * Service for detecting and managing trending news articles
 * Uses a sophisticated algorithm based on views, engagement, and recency
 */
export class TrendingService {
  // Weights for trending score calculation
  private static readonly WEIGHTS = {
    views: 0.4, // 40% weight on view count
    likes: 0.25, // 25% weight on likes
    comments: 0.2, // 20% weight on comments
    recency: 0.15, // 15% weight on how recent the article is
  };

  // Time decay factor (articles older than 48h get reduced score)
  private static readonly TRENDING_WINDOW_HOURS = 48;

  /**
   * Calculate trending score for an article
   */
  private static calculateTrendingScore(
    views: number,
    likes: number,
    comments: number,
    publishedAt: string
  ): number {
    const now = new Date().getTime();
    const published = new Date(publishedAt).getTime();
    const ageInHours = (now - published) / (1000 * 60 * 60);

    // Recency score (1.0 for new articles, decaying over time)
    const recencyScore = Math.max(0, 1 - ageInHours / this.TRENDING_WINDOW_HOURS);

    // Normalize values (simple linear normalization)
    const normalizedViews = Math.min(views / 1000, 1); // Cap at 1000 views
    const normalizedLikes = Math.min(likes / 100, 1); // Cap at 100 likes
    const normalizedComments = Math.min(comments / 50, 1); // Cap at 50 comments

    // Calculate weighted score
    const score =
      normalizedViews * this.WEIGHTS.views +
      normalizedLikes * this.WEIGHTS.likes +
      normalizedComments * this.WEIGHTS.comments +
      recencyScore * this.WEIGHTS.recency;

    return score;
  }

  /**
   * Get trending articles using engagement metrics
   */
  static async getTrendingArticles(limit: number = 10): Promise<NewsArticle[]> {
    try {
      // Get articles from the last 48 hours with their engagement stats
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - this.TRENDING_WINDOW_HOURS);

      // Fetch articles
      const { data: articles, error: articlesError } = await supabase
        .from('news_articles')
        .select('*')
        .gte('published_at', cutoffDate.toISOString())
        .order('published_at', { ascending: false })
        .limit(100); // Get more than we need for better selection

      if (articlesError) {
        throw articlesError;
      }

      if (!articles || articles.length === 0) {
        return [];
      }

      // Get engagement stats for all articles
      const articleIds = articles.map((a) => a.id);

      const { data: likesData } = await supabase
        .from('article_likes')
        .select('article_id')
        .in('article_id', articleIds);

      const { data: commentsData } = await supabase
        .from('article_comments')
        .select('article_id')
        .in('article_id', articleIds);

      // Count likes and comments per article
      const likesCount = new Map<string, number>();
      const commentsCount = new Map<string, number>();

      likesData?.forEach((like) => {
        likesCount.set(like.article_id, (likesCount.get(like.article_id) || 0) + 1);
      });

      commentsData?.forEach((comment) => {
        commentsCount.set(comment.article_id, (commentsCount.get(comment.article_id) || 0) + 1);
      });

      // Calculate trending scores
      const scoredArticles: TrendingScore[] = articles.map((article) => ({
        articleId: article.id,
        score: this.calculateTrendingScore(
          article.view_count || 0,
          likesCount.get(article.id) || 0,
          commentsCount.get(article.id) || 0,
          article.published_at
        ),
        views: article.view_count || 0,
        likes: likesCount.get(article.id) || 0,
        comments: commentsCount.get(article.id) || 0,
        recency: 0, // Will be calculated
      }));

      // Sort by score (descending) and take top N
      scoredArticles.sort((a, b) => b.score - a.score);
      const topArticleIds = scoredArticles.slice(0, limit).map((s) => s.articleId);

      // Return articles in order of trending score
      const trendingArticles = articles.filter((a) => topArticleIds.includes(a.id));
      trendingArticles.sort((a, b) => topArticleIds.indexOf(a.id) - topArticleIds.indexOf(b.id));

      return trendingArticles;
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  }

  /**
   * Detect breaking news based on rapid engagement growth
   */
  static async detectBreakingNews(limit: number = 5): Promise<NewsArticle[]> {
    try {
      // Get very recent articles (last 6 hours)
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 6);

      const { data: articles, error } = await supabase
        .from('news_articles')
        .select(
          `
          *,
          news_sources (
            id,
            name,
            logo_url
          )
        `
        )
        .gte('published_at', cutoffDate.toISOString())
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Articles with high view counts in short time are likely breaking news
      return articles || [];
    } catch (error) {
      console.error('Error detecting breaking news:', error);
      return [];
    }
  }

  /**
   * Get category-specific trending articles
   */
  static async getCategoryTrendingArticles(
    category: string,
    limit: number = 5
  ): Promise<NewsArticle[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - this.TRENDING_WINDOW_HOURS);

      const { data: articles, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('category', category)
        .gte('published_at', cutoffDate.toISOString())
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return articles || [];
    } catch (error) {
      console.error('Error fetching category trending articles:', error);
      return [];
    }
  }

  /**
   * Mark an article as trending (for caching/optimization)
   */
  static async markAsTrending(articleId: string): Promise<void> {
    try {
      // Could store trending status in a separate table or use a flag
      // For now, we'll just use the is_featured flag
      await supabase.from('news_articles').update({ is_featured: true }).eq('id', articleId);
    } catch (error) {
      console.error('Error marking article as trending:', error);
    }
  }

  /**
   * Get trending topics (most common tags in trending articles)
   */
  static async getTrendingTopics(limit: number = 10): Promise<string[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - this.TRENDING_WINDOW_HOURS);

      const { data: articles, error } = await supabase
        .from('news_articles')
        .select('tags')
        .gte('published_at', cutoffDate.toISOString())
        .order('view_count', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      if (!articles) {
        return [];
      }

      // Flatten all tags and count occurrences
      const tagCounts = new Map<string, number>();

      articles.forEach((article) => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach((tag: string) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      // Sort by count and return top N
      const sortedTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map((entry) => entry[0]);

      return sortedTags;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }
}
