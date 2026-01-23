import { supabase } from './supabase';
import { RSSService } from './rss.service';
import { ContentService } from './content.service';
import { NewsSource, ProcessedArticle, IngestionLog } from '../types';

interface IngestionResult {
  success: boolean;
  sourceId: string;
  sourceName: string;
  articlesFetched: number;
  articlesProcessed: number;
  articlesDuplicates: number;
  articlesStored: number;
  errors: string[];
  logId?: string;
}

export class IngestionService {
  private rssService: RSSService;
  private contentService: ContentService;

  constructor() {
    this.rssService = new RSSService();
    this.contentService = new ContentService();
  }

  /**
   * Ingest articles from a single RSS source
   */
  async ingestFromSource(source: NewsSource): Promise<IngestionResult> {
    const startTime = new Date().toISOString();
    const result: IngestionResult = {
      success: false,
      sourceId: source.id,
      sourceName: source.name,
      articlesFetched: 0,
      articlesProcessed: 0,
      articlesDuplicates: 0,
      articlesStored: 0,
      errors: [],
    };

    // Create ingestion log entry
    const logId = await this.createIngestionLog({
      source_id: source.id,
      source_name: source.name,
      status: 'in_progress',
      started_at: startTime,
    });

    result.logId = logId;

    try {
      // Validate RSS URL
      if (!source.rss_url) {
        throw new Error('RSS URL is missing');
      }

      if (!RSSService.isValidFeedUrl(source.rss_url)) {
        throw new Error('Invalid RSS URL format');
      }

      // Fetch RSS feed
      console.warn(`Fetching RSS feed from ${source.name}...`);
      const rawArticles = await this.rssService.parseFeed(source.rss_url);
      result.articlesFetched = rawArticles.length;

      if (rawArticles.length === 0) {
        throw new Error('No articles found in feed');
      }

      // Deduplicate by URL
      const deduplicated = RSSService.deduplicateArticles(rawArticles);
      result.articlesDuplicates = rawArticles.length - deduplicated.length;

      console.warn(`Processing ${deduplicated.length} articles from ${source.name}...`);

      // Process articles
      const processedArticles = await this.contentService.processArticles(
        deduplicated,
        source.name,
        source.website_url
      );
      result.articlesProcessed = processedArticles.length;

      // Check for existing articles by content hash
      const newArticles = await this.filterExistingArticles(processedArticles);
      result.articlesDuplicates += processedArticles.length - newArticles.length;

      // Store new articles
      if (newArticles.length > 0) {
        const stored = await this.storeArticles(newArticles);
        result.articlesStored = stored;
      }

      result.success = true;

      // Update log as success
      await this.updateIngestionLog(logId, {
        status: 'success',
        articles_fetched: result.articlesFetched,
        articles_processed: result.articlesProcessed,
        articles_duplicates: result.articlesDuplicates,
        completed_at: new Date().toISOString(),
      });

      console.warn(`✓ Successfully ingested ${result.articlesStored} articles from ${source.name}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      result.errors.push(errorMessage);
      result.success = false;

      console.error(`✗ Error ingesting from ${source.name}:`, errorMessage);

      // Update log as error
      await this.updateIngestionLog(logId, {
        status: 'error',
        error_message: errorMessage,
        articles_fetched: result.articlesFetched,
        articles_processed: result.articlesProcessed,
        articles_duplicates: result.articlesDuplicates,
        completed_at: new Date().toISOString(),
      });
    }

    return result;
  }

  /**
   * Ingest articles from multiple sources
   */
  async ingestFromMultipleSources(sources: NewsSource[]): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];

    for (const source of sources) {
      if (!source.is_active) {
        console.warn(`Skipping inactive source: ${source.name}`);
        continue;
      }

      const result = await this.ingestFromSource(source);
      results.push(result);

      // Add delay between sources to avoid overwhelming servers
      await this.delay(2000);
    }

    return results;
  }

  /**
   * Ingest from all active sources
   */
  async ingestFromAllSources(): Promise<IngestionResult[]> {
    try {
      const { data: sources, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .not('rss_url', 'is', null);

      if (error) {
        throw error;
      }

      if (!sources || sources.length === 0) {
        console.warn('No active sources with RSS URLs found');
        return [];
      }

      console.warn(`Starting ingestion from ${sources.length} sources...`);
      const results = await this.ingestFromMultipleSources(sources);

      // Log summary
      const summary = this.generateSummary(results);
      console.warn('\n=== Ingestion Summary ===');
      console.warn(`Total sources: ${summary.totalSources}`);
      console.warn(`Successful: ${summary.successful}`);
      console.warn(`Failed: ${summary.failed}`);
      console.warn(`Total articles fetched: ${summary.totalFetched}`);
      console.warn(`Total articles stored: ${summary.totalStored}`);
      console.warn(`Total duplicates: ${summary.totalDuplicates}`);
      console.warn('========================\n');

      return results;
    } catch (error) {
      console.error('Error in ingestFromAllSources:', error);
      return [];
    }
  }

  /**
   * Filter out articles that already exist in database
   */
  private async filterExistingArticles(articles: ProcessedArticle[]): Promise<ProcessedArticle[]> {
    try {
      const hashes = articles.map((a) => a.content_hash);

      const { data: existing } = await supabase
        .from('news_articles')
        .select('content_hash')
        .in('content_hash', hashes);

      if (!existing || existing.length === 0) {
        return articles;
      }

      const existingHashes = new Set(existing.map((e: any) => e.content_hash));
      return articles.filter((a) => !existingHashes.has(a.content_hash));
    } catch (error) {
      console.error('Error filtering existing articles:', error);
      return articles;
    }
  }

  /**
   * Store articles in database
   */
  private async storeArticles(articles: ProcessedArticle[]): Promise<number> {
    if (articles.length === 0) {
      return 0;
    }

    try {
      const { error } = await supabase.from('news_articles').upsert(
        articles.map((article) => ({
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content_snippet: article.content_snippet,
          image_url: article.image_url,
          article_url: article.article_url,
          // Use canonical_url as original_url for better duplicate detection
          // canonical_url is a normalized version of the article URL
          original_url: article.canonical_url,
          source_name: article.source_name,
          source_url: article.source_url,
          category: article.category,
          tags: article.tags,
          language: article.language,
          published_at: article.published_at,
          content_hash: article.content_hash,
          view_count: 0,
          is_featured: false,
        })),
        {
          onConflict: 'original_url',
          ignoreDuplicates: true,
        }
      );

      if (error) {
        console.error('Error storing articles:', error);
        return 0;
      }

      // Note: When ignoreDuplicates is true, Supabase doesn't return the count of actually inserted records
      // We return the number of articles we attempted to store as an approximation
      // Duplicate detection happens at two levels:
      // 1. Content hash filtering (done before calling this method)
      // 2. Original URL conflict handling (done by the database via upsert)
      return articles.length;
    } catch (error) {
      console.error('Error in storeArticles:', error);
      return 0;
    }
  }

  /**
   * Create ingestion log entry
   */
  private async createIngestionLog(logData: {
    source_id?: string;
    source_name: string;
    status: string;
    started_at: string;
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('ingestion_logs')
        .insert({
          source_id: logData.source_id,
          source_name: logData.source_name,
          status: logData.status,
          articles_fetched: 0,
          articles_processed: 0,
          articles_duplicates: 0,
          started_at: logData.started_at,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating ingestion log:', error);
        return '';
      }

      return data?.id || '';
    } catch (error) {
      console.error('Error in createIngestionLog:', error);
      return '';
    }
  }

  /**
   * Update ingestion log entry
   */
  private async updateIngestionLog(
    logId: string,
    updates: {
      status?: string;
      articles_fetched?: number;
      articles_processed?: number;
      articles_duplicates?: number;
      error_message?: string;
      completed_at?: string;
    }
  ): Promise<void> {
    try {
      await supabase.from('ingestion_logs').update(updates).eq('id', logId);
    } catch (error) {
      console.error('Error updating ingestion log:', error);
    }
  }

  /**
   * Get recent ingestion logs
   */
  async getIngestionLogs(limit: number = 50): Promise<IngestionLog[]> {
    try {
      const { data, error } = await supabase
        .from('ingestion_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching ingestion logs:', error);
      return [];
    }
  }

  /**
   * Get ingestion logs for a specific source
   */
  async getIngestionLogsBySource(sourceId: string, limit: number = 20): Promise<IngestionLog[]> {
    try {
      const { data, error } = await supabase
        .from('ingestion_logs')
        .select('*')
        .eq('source_id', sourceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching ingestion logs by source:', error);
      return [];
    }
  }

  /**
   * Generate summary of ingestion results
   */
  private generateSummary(results: IngestionResult[]): {
    totalSources: number;
    successful: number;
    failed: number;
    totalFetched: number;
    totalStored: number;
    totalDuplicates: number;
  } {
    return {
      totalSources: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalFetched: results.reduce((sum, r) => sum + r.articlesFetched, 0),
      totalStored: results.reduce((sum, r) => sum + r.articlesStored, 0),
      totalDuplicates: results.reduce((sum, r) => sum + r.articlesDuplicates, 0),
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Manual trigger for single source ingestion
   */
  async triggerManualIngestion(sourceId: string): Promise<IngestionResult> {
    try {
      const { data: source, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('id', sourceId)
        .single();

      if (error || !source) {
        throw new Error('Source not found');
      }

      return await this.ingestFromSource(source);
    } catch (error) {
      return {
        success: false,
        sourceId,
        sourceName: 'Unknown',
        articlesFetched: 0,
        articlesProcessed: 0,
        articlesDuplicates: 0,
        articlesStored: 0,
        errors: [(error as Error).message],
      };
    }
  }
}
