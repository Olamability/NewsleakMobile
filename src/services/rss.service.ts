import Parser from 'rss-parser';
import { RawArticle } from '../types';

interface RSSParserOptions {
  timeout?: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
}

export class RSSService {
  private parser: Parser;
  private readonly DEFAULT_TIMEOUT = 10000;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  constructor() {
    this.parser = new Parser({
      timeout: this.DEFAULT_TIMEOUT,
      customFields: {
        item: [
          ['media:content', 'media:content'],
          ['media:thumbnail', 'media:thumbnail'],
          ['content:encoded', 'content:encoded'],
          ['dc:creator', 'creator'],
        ],
      },
    });
  }

  /**
   * Parse RSS/Atom feed from URL with retry logic
   */
  async parseFeed(feedUrl: string, options?: RSSParserOptions): Promise<RawArticle[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const feed = await this.parser.parseURL(feedUrl);
        return this.normalizeFeedItems(feed.items);
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
   * Parse RSS feed from string content
   */
  async parseFeedString(feedContent: string): Promise<RawArticle[]> {
    try {
      const feed = await this.parser.parseString(feedContent);
      return this.normalizeFeedItems(feed.items);
    } catch (error) {
      throw new Error(`Failed to parse RSS feed string: ${(error as Error).message}`);
    }
  }

  /**
   * Normalize feed items to RawArticle format
   */
  private normalizeFeedItems(items: any[]): RawArticle[] {
    return items.map((item) => this.normalizeItem(item)).filter((item) => item !== null);
  }

  /**
   * Normalize a single feed item
   */
  private normalizeItem(item: any): RawArticle | null {
    try {
      // Extract title (required)
      const title = this.extractTitle(item);
      if (!title) {
        console.warn('Skipping item without title');
        return null;
      }

      // Extract link (required)
      const link = this.extractLink(item);
      if (!link) {
        console.warn('Skipping item without link:', title);
        return null;
      }

      // Extract other fields
      const description = this.extractDescription(item);
      const pubDate = this.extractPubDate(item);
      const creator = this.extractCreator(item);
      const content = this.extractContent(item);
      const contentSnippet = this.extractContentSnippet(item);
      const guid = this.extractGuid(item);
      const categories = this.extractCategories(item);
      const isoDate = this.extractIsoDate(item);
      const enclosure = this.extractEnclosure(item);

      return {
        title,
        description: description || undefined,
        link,
        pubDate: pubDate || undefined,
        creator: creator || undefined,
        content: content || undefined,
        contentSnippet: contentSnippet || undefined,
        guid: guid || undefined,
        categories,
        isoDate: isoDate || undefined,
        enclosure,
      };
    } catch (error) {
      console.error('Error normalizing feed item:', error);
      return null;
    }
  }

  /**
   * Extract title from various formats
   */
  private extractTitle(item: any): string | null {
    return item.title?.trim() || item['rss:title']?.trim() || null;
  }

  /**
   * Extract link from various formats
   */
  private extractLink(item: any): string | null {
    const link = item.link || item.guid || item.id;
    if (!link) return null;

    // Handle link objects
    if (typeof link === 'object') {
      return link.$ || link.href || null;
    }

    return typeof link === 'string' ? link.trim() : null;
  }

  /**
   * Extract description
   */
  private extractDescription(item: any): string | null {
    return (
      item.description?.trim() ||
      item.summary?.trim() ||
      item['rss:description']?.trim() ||
      item.contentSnippet?.trim() ||
      null
    );
  }

  /**
   * Extract publication date
   */
  private extractPubDate(item: any): string | null {
    return (
      item.pubDate ||
      item.published ||
      item.updated ||
      item.isoDate ||
      item['dc:date'] ||
      item.date ||
      null
    );
  }

  /**
   * Extract creator/author
   */
  private extractCreator(item: any): string | null {
    return (
      item.creator ||
      item.author ||
      item['dc:creator'] ||
      item['itunes:author'] ||
      (typeof item.creator === 'object' ? item.creator.name : null) ||
      null
    );
  }

  /**
   * Extract full content
   */
  private extractContent(item: any): string | null {
    return (
      item.content ||
      item['content:encoded'] ||
      item['atom:content'] ||
      item.description ||
      null
    );
  }

  /**
   * Extract content snippet
   */
  private extractContentSnippet(item: any): string | null {
    return item.contentSnippet || item.summary || null;
  }

  /**
   * Extract GUID
   */
  private extractGuid(item: any): string | null {
    const guid = item.guid || item.id;
    if (!guid) return null;

    // Handle guid objects
    if (typeof guid === 'object') {
      return guid._ || guid.value || null;
    }

    return typeof guid === 'string' ? guid.trim() : null;
  }

  /**
   * Extract categories
   */
  private extractCategories(item: any): string[] {
    const categories: string[] = [];

    if (Array.isArray(item.categories)) {
      categories.push(...item.categories.filter((c: any) => typeof c === 'string'));
    } else if (item.category) {
      if (Array.isArray(item.category)) {
        categories.push(...item.category);
      } else if (typeof item.category === 'string') {
        categories.push(item.category);
      }
    }

    return categories.filter((c) => c && c.trim()).map((c) => c.trim());
  }

  /**
   * Extract ISO date
   */
  private extractIsoDate(item: any): string | null {
    return item.isoDate || null;
  }

  /**
   * Extract enclosure (media attachments)
   */
  private extractEnclosure(item: any): RawArticle['enclosure'] {
    const enclosure = item.enclosure || item['media:content'] || item['media:thumbnail'];

    if (!enclosure) return undefined;

    // Handle array of enclosures
    if (Array.isArray(enclosure)) {
      const firstEnclosure = enclosure[0];
      return this.normalizeEnclosure(firstEnclosure);
    }

    return this.normalizeEnclosure(enclosure);
  }

  /**
   * Normalize enclosure object
   */
  private normalizeEnclosure(enclosure: any): RawArticle['enclosure'] {
    if (!enclosure) return undefined;

    return {
      url: enclosure.url || enclosure.$ || enclosure.href || undefined,
      type: enclosure.type || enclosure.medium || undefined,
      length: enclosure.length || undefined,
    };
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

  /**
   * Get feed metadata without fetching all items
   */
  async getFeedMetadata(feedUrl: string): Promise<{
    title?: string;
    description?: string;
    link?: string;
    language?: string;
  }> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      return {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        language: feed.language,
      };
    } catch (error) {
      throw new Error(`Failed to get feed metadata: ${(error as Error).message}`);
    }
  }
}
