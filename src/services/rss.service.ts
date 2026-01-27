import Parser from 'rss-parser';
import axios from 'axios';
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
          ['enclosure', 'enclosure'],
          ['media:group', 'media:group'],
          ['itunes:image', 'itunes:image'],
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
        // Fetch RSS feed content using axios (React Native compatible)
        const response = await axios.get(feedUrl, {
          timeout: options?.timeout || this.DEFAULT_TIMEOUT,
          maxRedirects: options?.maxRedirects || 5,
          headers: {
            'User-Agent': 'NewsArena/1.0 (News Aggregator Mobile App)',
            Accept: 'application/rss+xml',
            ...options?.headers,
          },
          responseType: 'text',
        });

        // Parse the RSS feed string
        const feed = await this.parser.parseString(response.data);
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
  private normalizeFeedItems(items: unknown[]): RawArticle[] {
    return items.map((item) => this.normalizeItem(item)).filter((item) => item !== null);
  }

  /**
   * Normalize a single feed item
   */
  private normalizeItem(item: unknown): RawArticle | null {
    try {
      const itemObj = item as Record<string, unknown>;

      // Extract title (required)
      const title = this.extractTitle(itemObj);
      if (!title) {
        console.warn('Skipping item without title');
        return null;
      }

      // Extract link (required)
      const link = this.extractLink(itemObj);
      if (!link) {
        console.warn('Skipping item without link:', title);
        return null;
      }

      // Extract other fields
      const description = this.extractDescription(itemObj);
      const pubDate = this.extractPubDate(itemObj);
      const creator = this.extractCreator(itemObj);
      const content = this.extractContent(itemObj);
      const contentSnippet = this.extractContentSnippet(itemObj);
      const guid = this.extractGuid(itemObj);
      const categories = this.extractCategories(itemObj);
      const isoDate = this.extractIsoDate(itemObj);
      const enclosure = this.extractEnclosure(itemObj);

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
  private extractTitle(item: Record<string, unknown>): string | null {
    const title = item.title || item['rss:title'];
    return typeof title === 'string' ? title.trim() : null;
  }

  /**
   * Extract link from various formats
   */
  private extractLink(item: Record<string, unknown>): string | null {
    const link = item.link || item.guid || item.id;
    if (!link) return null;

    // Handle link objects
    if (typeof link === 'object' && link !== null) {
      const linkObj = link as Record<string, unknown>;
      return (linkObj.$ as string) || (linkObj.href as string) || null;
    }

    return typeof link === 'string' ? link.trim() : null;
  }

  /**
   * Extract description
   */
  private extractDescription(item: Record<string, unknown>): string | null {
    const desc = item.description || item.summary || item['rss:description'] || item.contentSnippet;
    return typeof desc === 'string' ? desc.trim() : null;
  }

  /**
   * Extract publication date
   */
  private extractPubDate(item: Record<string, unknown>): string | null {
    const date =
      item.pubDate ||
      item.published ||
      item.updated ||
      item.isoDate ||
      item['dc:date'] ||
      item.date;
    return typeof date === 'string' ? date : null;
  }

  /**
   * Extract creator/author
   */
  private extractCreator(item: Record<string, unknown>): string | null {
    const creator = item.creator || item.author || item['dc:creator'] || item['itunes:author'];
    if (typeof creator === 'string') return creator;
    if (typeof creator === 'object' && creator !== null) {
      return ((creator as Record<string, unknown>).name as string) || null;
    }
    return null;
  }

  /**
   * Extract full content
   */
  private extractContent(item: Record<string, unknown>): string | null {
    const content =
      item.content || item['content:encoded'] || item['atom:content'] || item.description;
    return typeof content === 'string' ? content : null;
  }

  /**
   * Extract content snippet
   */
  private extractContentSnippet(item: Record<string, unknown>): string | null {
    const snippet = item.contentSnippet || item.summary;
    return typeof snippet === 'string' ? snippet : null;
  }

  /**
   * Extract GUID
   */
  private extractGuid(item: Record<string, unknown>): string | null {
    const guid = item.guid || item.id;
    if (!guid) return null;

    // Handle guid objects
    if (typeof guid === 'object' && guid !== null) {
      const guidObj = guid as Record<string, unknown>;
      return (guidObj._ as string) || (guidObj.value as string) || null;
    }

    return typeof guid === 'string' ? guid.trim() : null;
  }

  /**
   * Extract categories
   */
  private extractCategories(item: Record<string, unknown>): string[] {
    const categories: string[] = [];

    if (Array.isArray(item.categories)) {
      categories.push(...item.categories.filter((c: unknown) => typeof c === 'string'));
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
  private extractIsoDate(item: Record<string, unknown>): string | null {
    const date = item.isoDate;
    return typeof date === 'string' ? date : null;
  }

  /**
   * Extract enclosure (media attachments)
   */
  private extractEnclosure(item: Record<string, unknown>): RawArticle['enclosure'] {
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
  private normalizeEnclosure(enclosure: unknown): RawArticle['enclosure'] {
    if (!enclosure || typeof enclosure !== 'object') return undefined;

    const enc = enclosure as Record<string, unknown>;
    return {
      url: (enc.url as string) || (enc.$ as string) || (enc.href as string) || undefined,
      type: (enc.type as string) || (enc.medium as string) || undefined,
      length: (enc.length as string) || undefined,
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
      // Fetch RSS feed content using axios (React Native compatible)
      const response = await axios.get(feedUrl, {
        timeout: this.DEFAULT_TIMEOUT,
        headers: {
          'User-Agent': 'NewsArena/1.0 (News Aggregator Mobile App)',
          Accept: 'application/rss+xml',
        },
        responseType: 'text',
      });

      // Parse the RSS feed string
      const feed = await this.parser.parseString(response.data);
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
