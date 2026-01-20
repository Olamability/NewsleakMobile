import axios from 'axios';
import { RawArticle } from '../types';

interface RSSParserOptions {
  timeout?: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
}

interface ParseRSSResponse {
  success: boolean;
  articles: RawArticle[];
  error?: string;
  feedMetadata?: {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
  };
}

export class RSSService {
  private readonly DEFAULT_TIMEOUT = 10000;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;
  private readonly RSS_PARSER_URL: string;

  constructor() {
    // Use custom RSS parser URL if provided, otherwise use Supabase Edge Function
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const customUrl = process.env.EXPO_PUBLIC_RSS_PARSER_URL;
    
    this.RSS_PARSER_URL = customUrl || `${supabaseUrl}/functions/v1/parse-rss`;
  }

  /**
   * Parse RSS/Atom feed from URL with retry logic
   * Now uses backend Edge Function for parsing
   */
  async parseFeed(feedUrl: string, options?: RSSParserOptions): Promise<RawArticle[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Call backend Edge Function to parse RSS
        const response = await axios.post<ParseRSSResponse>(
          this.RSS_PARSER_URL,
          {
            feedUrl,
            timeout: options?.timeout || this.DEFAULT_TIMEOUT,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
              ...options?.headers,
            },
            timeout: (options?.timeout || this.DEFAULT_TIMEOUT) + 5000, // Add buffer for network overhead
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to parse RSS feed');
        }

        return response.data.articles;
      } catch (error) {
        lastError = error as Error;
        console.error(`RSS parse attempt ${attempt} failed for ${feedUrl}:`, error);

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }

    throw new Error(
      `Failed to parse RSS feed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`
    );
  }

  /**
   * Get feed metadata without fetching all items
   * Now uses backend Edge Function for parsing
   */
  async getFeedMetadata(feedUrl: string): Promise<{
    title?: string;
    description?: string;
    link?: string;
    language?: string;
  }> {
    try {
      // Call backend Edge Function to parse RSS and get metadata
      const response = await axios.post<ParseRSSResponse>(
        this.RSS_PARSER_URL,
        {
          feedUrl,
          timeout: this.DEFAULT_TIMEOUT,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          timeout: this.DEFAULT_TIMEOUT + 5000,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get feed metadata');
      }

      return response.data.feedMetadata || {};
    } catch (error) {
      throw new Error(`Failed to get feed metadata: ${(error as Error).message}`);
    }
  }

  /**
   * Validate feed URL format
   */
  static isValidFeedUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Deduplicate articles by URL and content hash
   */
  static deduplicateArticles(articles: RawArticle[]): RawArticle[] {
    const seen = new Set<string>();
    const deduplicated: RawArticle[] = [];

    for (const article of articles) {
      // Create a unique key from URL and title
      const key = `${article.link}::${article.title}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(article);
      }
    }

    return deduplicated;
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
