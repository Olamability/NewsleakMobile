import { supabase } from './supabase';
import { NewsSource } from '../types';

export interface CredibilityScore {
  source_id: string;
  source_name: string;
  overall_score: number; // 0-100
  reliability_score: number; // Based on article quality
  engagement_score: number; // Based on views and reads
  freshness_score: number; // Based on update frequency
  diversity_score: number; // Based on category coverage
  last_calculated_at: string;
}

export interface CredibilityFactors {
  avgArticleQuality: number;
  avgEngagement: number;
  updateFrequency: number;
  categoryDiversity: number;
  errorRate: number;
}

export class CredibilityService {
  /**
   * Calculate overall credibility score for a source
   */
  static calculateCredibilityScore(factors: CredibilityFactors): number {
    const weights = {
      quality: 0.3,
      engagement: 0.25,
      frequency: 0.2,
      diversity: 0.15,
      errorRate: 0.1,
    };

    // Invert error rate (lower is better)
    const errorScore = Math.max(0, 100 - factors.errorRate);

    const score =
      factors.avgArticleQuality * weights.quality +
      factors.avgEngagement * weights.engagement +
      factors.updateFrequency * weights.frequency +
      factors.categoryDiversity * weights.diversity +
      errorScore * weights.errorRate;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Get credibility score for a source
   */
  static async getSourceCredibility(sourceId: string): Promise<CredibilityScore | null> {
    try {
      const { data: source } = await supabase
        .from('news_sources')
        .select('name')
        .eq('id', sourceId)
        .single();

      if (!source) return null;

      // Get articles from this source
      const { data: articles } = await supabase
        .from('news_articles')
        .select('*')
        .eq('source_id', sourceId);

      if (!articles || articles.length === 0) {
        return {
          source_id: sourceId,
          source_name: source.name,
          overall_score: 50, // Default for new sources
          reliability_score: 50,
          engagement_score: 50,
          freshness_score: 50,
          diversity_score: 50,
          last_calculated_at: new Date().toISOString(),
        };
      }

      // Calculate factors
      const factors = await this.calculateSourceFactors(sourceId, articles);

      // Calculate individual scores
      const reliabilityScore = this.calculateReliabilityScore(factors);
      const engagementScore = this.calculateEngagementScore(factors);
      const freshnessScore = this.calculateFreshnessScore(factors);
      const diversityScore = this.calculateDiversityScore(factors);

      // Calculate overall score
      const overallScore = this.calculateCredibilityScore(factors);

      return {
        source_id: sourceId,
        source_name: source.name,
        overall_score: overallScore,
        reliability_score: reliabilityScore,
        engagement_score: engagementScore,
        freshness_score: freshnessScore,
        diversity_score: diversityScore,
        last_calculated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting source credibility:', error);
      return null;
    }
  }

  /**
   * Calculate source factors for credibility scoring
   */
  private static async calculateSourceFactors(
    sourceId: string,
    articles: any[]
  ): Promise<CredibilityFactors> {
    // Calculate average article quality (based on completeness)
    const qualityScores = articles.map((article) => {
      let score = 0;
      if (article.title && article.title.length > 10) score += 25;
      if (article.summary && article.summary.length > 50) score += 25;
      if (article.image_url) score += 25;
      if (article.content_snippet && article.content_snippet.length > 100) score += 25;
      return score;
    });
    const avgArticleQuality =
      qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length || 0;

    // Calculate average engagement (views per article)
    const avgViews =
      articles.reduce((sum, a) => sum + (a.view_count || 0), 0) / articles.length || 0;
    const avgEngagement = Math.min(100, avgViews / 10); // Normalize to 0-100

    // Calculate update frequency (articles per day)
    const sortedArticles = [...articles].sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    let updateFrequency = 50; // Default
    if (sortedArticles.length >= 2) {
      const oldestDate = new Date(sortedArticles[sortedArticles.length - 1].published_at);
      const newestDate = new Date(sortedArticles[0].published_at);
      const daysDiff = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 0) {
        const articlesPerDay = articles.length / daysDiff;
        // Score: 1+ articles/day = 100, 0.5 articles/day = 50, etc.
        updateFrequency = Math.min(100, articlesPerDay * 100);
      }
    }

    // Calculate category diversity
    const categories = new Set(articles.map((a) => a.category));
    const diversityScore = Math.min(100, (categories.size / 8) * 100); // Assuming 8+ categories is excellent

    // Calculate error rate (articles with missing critical fields)
    const errors = articles.filter(
      (a) => !a.title || !a.article_url || !a.published_at
    ).length;
    const errorRate = (errors / articles.length) * 100;

    return {
      avgArticleQuality,
      avgEngagement,
      updateFrequency,
      categoryDiversity: diversityScore,
      errorRate,
    };
  }

  /**
   * Calculate reliability score
   */
  private static calculateReliabilityScore(factors: CredibilityFactors): number {
    // Reliability is based on quality and low error rate
    const errorScore = Math.max(0, 100 - factors.errorRate);
    return Math.round((factors.avgArticleQuality * 0.7 + errorScore * 0.3));
  }

  /**
   * Calculate engagement score
   */
  private static calculateEngagementScore(factors: CredibilityFactors): number {
    return Math.round(factors.avgEngagement);
  }

  /**
   * Calculate freshness score
   */
  private static calculateFreshnessScore(factors: CredibilityFactors): number {
    return Math.round(factors.updateFrequency);
  }

  /**
   * Calculate diversity score
   */
  private static calculateDiversityScore(factors: CredibilityFactors): number {
    return Math.round(factors.categoryDiversity);
  }

  /**
   * Get all source credibility scores
   */
  static async getAllSourceCredibility(): Promise<CredibilityScore[]> {
    try {
      const { data: sources } = await supabase
        .from('news_sources')
        .select('id')
        .eq('is_active', true);

      if (!sources) return [];

      const scores: CredibilityScore[] = [];

      for (const source of sources) {
        const score = await this.getSourceCredibility(source.id);
        if (score) {
          scores.push(score);
        }
      }

      // Sort by overall score (descending)
      scores.sort((a, b) => b.overall_score - a.overall_score);

      return scores;
    } catch (error) {
      console.error('Error getting all source credibility:', error);
      return [];
    }
  }

  /**
   * Get credibility badge/label for a score
   */
  static getCredibilityBadge(score: number): {
    label: string;
    color: string;
    icon: string;
  } {
    if (score >= 90) {
      return { label: 'Highly Credible', color: '#10B981', icon: '✓✓✓' };
    } else if (score >= 75) {
      return { label: 'Credible', color: '#3B82F6', icon: '✓✓' };
    } else if (score >= 60) {
      return { label: 'Moderately Credible', color: '#F59E0B', icon: '✓' };
    } else if (score >= 40) {
      return { label: 'Low Credibility', color: '#EF4444', icon: '!' };
    } else {
      return { label: 'Very Low Credibility', color: '#DC2626', icon: '!!' };
    }
  }

  /**
   * Update credibility scores for all sources (background job)
   */
  static async updateAllCredibilityScores(): Promise<void> {
    try {
      const scores = await this.getAllSourceCredibility();

      // Store in a credibility_scores table if it exists
      for (const score of scores) {
        try {
          await supabase.from('source_credibility').upsert(
            {
              source_id: score.source_id,
              overall_score: score.overall_score,
              reliability_score: score.reliability_score,
              engagement_score: score.engagement_score,
              freshness_score: score.freshness_score,
              diversity_score: score.diversity_score,
              last_calculated_at: score.last_calculated_at,
            },
            {
              onConflict: 'source_id',
            }
          );
        } catch {
          // Table might not exist
        }
      }
    } catch (error) {
      console.error('Error updating credibility scores:', error);
    }
  }

  /**
   * Get top credible sources
   */
  static async getTopCredibleSources(limit: number = 10): Promise<NewsSource[]> {
    try {
      const scores = await this.getAllSourceCredibility();
      const topScores = scores.slice(0, limit);

      const sourceIds = topScores.map((s) => s.source_id);

      const { data: sources } = await supabase
        .from('news_sources')
        .select('*')
        .in('id', sourceIds);

      return sources || [];
    } catch (error) {
      console.error('Error getting top credible sources:', error);
      return [];
    }
  }
}
