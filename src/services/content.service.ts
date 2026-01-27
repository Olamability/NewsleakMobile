import sanitizeHtml from 'sanitize-html';
import CryptoJS from 'crypto-js';
import { RawArticle, ProcessedArticle, ArticleStatus } from '../types';

interface ContentProcessingOptions {
  defaultCategory?: string;
  defaultLanguage?: string;
  defaultImageUrl?: string;
  maxSummaryLength?: number;
}

export class ContentService {
  private readonly MAX_SUMMARY_LENGTH = 300;
  private readonly CATEGORY_KEYWORDS = {
    politics: ['election', 'government', 'president', 'parliament', 'minister', 'political'],
    technology: ['tech', 'ai', 'software', 'startup', 'crypto', 'blockchain', 'digital'],
    business: ['business', 'economy', 'market', 'stock', 'finance', 'trade', 'company'],
    sports: ['sport', 'football', 'basketball', 'soccer', 'tennis', 'olympics', 'match'],
    entertainment: ['entertainment', 'movie', 'music', 'celebrity', 'film', 'concert', 'album'],
    health: ['health', 'medical', 'vaccine', 'disease', 'doctor', 'hospital', 'wellness'],
    science: ['science', 'research', 'study', 'discovery', 'scientist', 'experiment'],
    world: ['world', 'international', 'global', 'country', 'nation', 'foreign'],
  };

  /**
   * Process raw article to normalized format
   */
  async processArticle(
    rawArticle: RawArticle,
    sourceName: string,
    sourceUrl: string,
    options?: ContentProcessingOptions
  ): Promise<ProcessedArticle> {
    const title = this.cleanText(rawArticle.title);
    const slug = this.generateSlug(title);
    const summary = this.extractSummary(rawArticle, options?.maxSummaryLength);
    const content_snippet = this.extractContentSnippet(rawArticle);
    // Extract image from RSS feed data, don't use fallback
    const image_url = this.extractImageUrl(rawArticle) || options?.defaultImageUrl || '';
    const article_url = this.cleanUrl(rawArticle.link);
    const canonical_url = this.createCanonicalUrl(article_url);
    const category = this.inferCategory(rawArticle, options?.defaultCategory);
    const tags = this.extractTags(rawArticle);
    const language = this.detectLanguage(rawArticle, options?.defaultLanguage);
    const published_at = this.normalizeDate(rawArticle);
    const content_hash = this.generateContentHash(article_url, title);

    return {
      title,
      slug,
      summary,
      content_snippet,
      image_url,
      article_url,
      canonical_url,
      source_name: sourceName,
      source_url: sourceUrl,
      category,
      tags,
      language,
      published_at,
      content_hash,
      status: 'pending_approval' as ArticleStatus,
    };
  }

  /**
   * Clean HTML content
   */
  cleanHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote'],
      allowedAttributes: {
        a: ['href', 'title'],
      },
      allowedSchemes: ['http', 'https'],
      transformTags: {
        a: (tagName, attribs) => {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer nofollow',
              target: '_blank',
            },
          };
        },
      },
    });
  }

  /**
   * Clean and normalize text
   */
  cleanText(text: string): string {
    if (!text) return '';

    // First remove HTML tags using sanitize-html
    const withoutTags = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

    // Then normalize whitespace
    return withoutTags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract and clean summary
   */
  private extractSummary(rawArticle: RawArticle, maxLength?: number): string {
    const max = maxLength || this.MAX_SUMMARY_LENGTH;
    let summary =
      rawArticle.description || rawArticle.contentSnippet || rawArticle.content || rawArticle.title;

    summary = this.cleanText(summary);

    // Truncate if too long
    if (summary.length > max) {
      summary = summary.substring(0, max);
      const lastSpace = summary.lastIndexOf(' ');
      if (lastSpace > max * 0.8) {
        summary = summary.substring(0, lastSpace);
      }
      summary = summary.trim() + '...';
    }

    return summary;
  }

  /**
   * Extract content snippet
   */
  private extractContentSnippet(rawArticle: RawArticle): string | undefined {
    const content = rawArticle.content || rawArticle.description;
    if (!content) return undefined;

    const cleaned = this.cleanText(content);
    return cleaned.length > 500 ? cleaned.substring(0, 500) + '...' : cleaned;
  }

  /**
   * Extract image URL from various sources
   */
  private extractImageUrl(rawArticle: RawArticle): string | null {
    // Check enclosure first (most reliable for RSS feeds)
    if (rawArticle.enclosure?.url) {
      const url = rawArticle.enclosure.url;
      if (this.isImageUrl(url)) {
        return url;
      }
    }

    // Check for media:content or media:thumbnail
    const item = rawArticle as unknown as Record<string, unknown>;

    // Handle media:content (can be array or object)
    if (item['media:content']) {
      const mediaContent = item['media:content'];
      if (Array.isArray(mediaContent)) {
        // Find first image in array
        for (const media of mediaContent) {
          if (typeof media === 'object' && media !== null) {
            const mediaUrl = (media as Record<string, unknown>).url;
            if (typeof mediaUrl === 'string' && this.isImageUrl(mediaUrl)) {
              return mediaUrl;
            }
          }
        }
      } else if (typeof mediaContent === 'object' && mediaContent !== null) {
        const mediaUrl = (mediaContent as Record<string, unknown>).url;
        if (typeof mediaUrl === 'string' && this.isImageUrl(mediaUrl)) {
          return mediaUrl;
        }
      }
    }

    // Handle media:thumbnail (can be array or object)
    if (item['media:thumbnail']) {
      const mediaThumbnail = item['media:thumbnail'];
      if (Array.isArray(mediaThumbnail)) {
        // Find first image in array
        for (const thumb of mediaThumbnail) {
          if (typeof thumb === 'object' && thumb !== null) {
            const thumbUrl = (thumb as Record<string, unknown>).url;
            if (typeof thumbUrl === 'string' && this.isImageUrl(thumbUrl)) {
              return thumbUrl;
            }
          }
        }
      } else if (typeof mediaThumbnail === 'object' && mediaThumbnail !== null) {
        const thumbUrl = (mediaThumbnail as Record<string, unknown>).url;
        if (typeof thumbUrl === 'string' && this.isImageUrl(thumbUrl)) {
          return thumbUrl;
        }
      }
    }

    // Check content for images (look for og:image meta tags and img tags)
    if (rawArticle.content) {
      // Try to find Open Graph image first
      const ogImageMatch = rawArticle.content.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      );
      if (ogImageMatch && ogImageMatch[1]) {
        return ogImageMatch[1];
      }

      // Fall back to img tags
      const imageMatch = rawArticle.content.match(/<img[^>]+src="([^">]+)"/i);
      if (imageMatch && imageMatch[1] && this.isImageUrl(imageMatch[1])) {
        return imageMatch[1];
      }
    }

    // Check description for images
    if (rawArticle.description) {
      const imageMatch = rawArticle.description.match(/<img[^>]+src="([^">]+)"/i);
      if (imageMatch && imageMatch[1] && this.isImageUrl(imageMatch[1])) {
        return imageMatch[1];
      }
    }

    return null;
  }

  /**
   * Check if URL is an image
   */
  private isImageUrl(url: string): boolean {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some((ext) => lowerUrl.includes(ext));
  }

  /**
   * Clean and validate URL
   */
  private cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove tracking parameters
      const trackingParams = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
      ];
      trackingParams.forEach((param) => urlObj.searchParams.delete(param));
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Create canonical URL
   */
  private createCanonicalUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove all query parameters and fragments for canonical URL
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  /**
   * Infer category from article content
   */
  private inferCategory(rawArticle: RawArticle, defaultCategory?: string): string {
    // Check explicit categories first
    if (rawArticle.categories && rawArticle.categories.length > 0) {
      const firstCategory = rawArticle.categories[0].toLowerCase();
      // Check if it matches our known categories
      for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => firstCategory.includes(kw))) {
          return category;
        }
      }
      // Return the first category if no match found
      return this.cleanText(rawArticle.categories[0]).toLowerCase();
    }

    // Infer from content
    const text = `${rawArticle.title} ${rawArticle.description || ''}`.toLowerCase();

    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category;
      }
    }

    return defaultCategory || 'general';
  }

  /**
   * Extract tags from article
   */
  private extractTags(rawArticle: RawArticle): string[] {
    const tags = new Set<string>();

    // Add categories as tags
    if (rawArticle.categories) {
      rawArticle.categories.forEach((cat) => tags.add(this.cleanText(cat).toLowerCase()));
    }

    // Extract keywords from title (simple approach)
    const titleWords = rawArticle.title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4); // Only words longer than 4 chars

    titleWords.slice(0, 5).forEach((word) => tags.add(word)); // Add up to 5 keywords

    return Array.from(tags).slice(0, 10); // Limit to 10 tags
  }

  /**
   * Basic language detection
   */
  private detectLanguage(rawArticle: RawArticle, defaultLanguage?: string): string {
    const text = `${rawArticle.title} ${rawArticle.description || ''}`;

    // Simple language detection based on character patterns
    // Nigerian/African English patterns
    if (/\b(naira|lagos|abuja|nigeria|buhari)\b/i.test(text)) {
      return 'en-NG';
    }

    // Check for non-English characters
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Cyrillic
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja'; // Japanese
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean

    return defaultLanguage || 'en';
  }

  /**
   * Normalize publication date
   */
  private normalizeDate(rawArticle: RawArticle): string {
    const dateStr = rawArticle.isoDate || rawArticle.pubDate;

    if (!dateStr) {
      return new Date().toISOString();
    }

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Generate content hash for deduplication
   */
  generateContentHash(url: string, title: string): string {
    const content = `${url}::${title}`;
    return CryptoJS.SHA256(content).toString();
  }

  /**
   * Validate processed article
   */
  validateArticle(article: ProcessedArticle): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!article.title || article.title.length < 10) {
      errors.push('Title must be at least 10 characters');
    }

    if (!article.summary || article.summary.length < 20) {
      errors.push('Summary must be at least 20 characters');
    }

    if (!article.article_url) {
      errors.push('Article URL is required');
    }

    if (!article.source_name) {
      errors.push('Source name is required');
    }

    if (!article.published_at) {
      errors.push('Published date is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Batch process multiple articles
   */
  async processArticles(
    rawArticles: RawArticle[],
    sourceName: string,
    sourceUrl: string,
    options?: ContentProcessingOptions
  ): Promise<ProcessedArticle[]> {
    const processed: ProcessedArticle[] = [];

    for (const rawArticle of rawArticles) {
      try {
        const article = await this.processArticle(rawArticle, sourceName, sourceUrl, options);
        const validation = this.validateArticle(article);

        if (validation.isValid) {
          processed.push(article);
        } else {
          console.warn('Invalid article:', article.title, validation.errors);
        }
      } catch (error) {
        console.error('Error processing article:', error);
      }
    }

    return processed;
  }
}
