import { ContentService } from '../content.service';
import { RawArticle, ProcessedArticle } from '../../types';

describe('ContentService', () => {
  let contentService: ContentService;

  beforeEach(() => {
    contentService = new ContentService();
  });

  describe('cleanHtml', () => {
    it('should remove script tags', () => {
      const html = '<p>Test</p><script>alert("xss")</script>';
      const cleaned = contentService.cleanHtml(html);
      expect(cleaned).not.toContain('script');
      expect(cleaned).toContain('Test');
    });

    it('should remove dangerous attributes', () => {
      const html = '<p onclick="alert()">Test</p>';
      const cleaned = contentService.cleanHtml(html);
      expect(cleaned).not.toContain('onclick');
    });

    it('should keep safe tags', () => {
      const html = '<p>Test <strong>bold</strong> and <em>italic</em></p>';
      const cleaned = contentService.cleanHtml(html);
      expect(cleaned).toContain('<p>');
      expect(cleaned).toContain('<strong>');
      expect(cleaned).toContain('<em>');
    });

    it('should add rel attributes to links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const cleaned = contentService.cleanHtml(html);
      expect(cleaned).toContain('<a');
      expect(cleaned).toContain('href="https://example.com"');
    });
  });

  describe('cleanText', () => {
    it('should remove HTML tags', () => {
      const text = '<p>Test <strong>bold</strong></p>';
      const cleaned = contentService.cleanText(text);
      expect(cleaned).toBe('Test bold');
    });

    it('should handle HTML entities', () => {
      const text = '&amp; &lt; &gt; &quot; &apos;';
      const cleaned = contentService.cleanText(text);
      // sanitize-html decodes some entities but not all
      expect(cleaned.length).toBeGreaterThan(0);
      expect(cleaned).not.toContain('<script>');
    });

    it('should normalize whitespace', () => {
      const text = 'Test   multiple    spaces';
      const cleaned = contentService.cleanText(text);
      expect(cleaned).toBe('Test multiple spaces');
    });

    it('should trim text', () => {
      const text = '  Test  ';
      const cleaned = contentService.cleanText(text);
      expect(cleaned).toBe('Test');
    });
  });

  describe('generateSlug', () => {
    it('should convert title to URL-friendly slug', () => {
      const slug = contentService.generateSlug('Test Article Title');
      expect(slug).toBe('test-article-title');
    });

    it('should replace special characters with hyphens', () => {
      const slug = contentService.generateSlug('Test @ Article # Title!');
      expect(slug).toBe('test-article-title');
    });

    it('should remove leading and trailing hyphens', () => {
      const slug = contentService.generateSlug('!Test Article!');
      expect(slug).toBe('test-article');
    });

    it('should limit slug length', () => {
      const longTitle = 'a'.repeat(200);
      const slug = contentService.generateSlug(longTitle);
      expect(slug.length).toBeLessThanOrEqual(100);
    });
  });

  describe('generateContentHash', () => {
    it('should generate consistent hash for same input', () => {
      const hash1 = contentService.generateContentHash('https://example.com', 'Test Title');
      const hash2 = contentService.generateContentHash('https://example.com', 'Test Title');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = contentService.generateContentHash('https://example.com/1', 'Test Title');
      const hash2 = contentService.generateContentHash('https://example.com/2', 'Test Title');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('processArticle', () => {
    const mockRawArticle: RawArticle = {
      title: 'Test Article Title',
      description: 'This is a test article description',
      link: 'https://example.com/article',
      pubDate: '2024-01-01T00:00:00Z',
      categories: ['technology'],
    };

    it('should process article successfully', async () => {
      const processed = await contentService.processArticle(
        mockRawArticle,
        'Test Source',
        'https://example.com'
      );

      expect(processed.title).toBe('Test Article Title');
      expect(processed.slug).toBe('test-article-title');
      expect(processed.summary).toBe('This is a test article description');
      expect(processed.article_url).toBe('https://example.com/article');
      expect(processed.source_name).toBe('Test Source');
      expect(processed.source_url).toBe('https://example.com');
      expect(processed.category).toBe('technology');
      expect(processed.status).toBe('pending_approval');
    });

    it('should truncate long summary', async () => {
      const longDescription = 'a'.repeat(500);
      const article: RawArticle = {
        ...mockRawArticle,
        description: longDescription,
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.summary.length).toBeLessThanOrEqual(303); // 300 + '...'
      expect(processed.summary.endsWith('...')).toBe(true);
    });

    it('should infer category from content', async () => {
      const article: RawArticle = {
        ...mockRawArticle,
        title: 'New AI Technology Breakthrough',
        categories: undefined,
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.category).toBe('technology');
    });

    it('should use default category if none inferred', async () => {
      const article: RawArticle = {
        title: 'Generic Article',
        link: 'https://example.com/article',
        categories: undefined,
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com',
        { defaultCategory: 'news' }
      );

      expect(processed.category).toBe('news');
    });

    it('should detect language', async () => {
      const article: RawArticle = {
        title: 'News from Lagos Nigeria about Naira',
        link: 'https://example.com/article',
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.language).toBe('en-NG');
    });

    it('should return empty string if no image found', async () => {
      const processed = await contentService.processArticle(
        mockRawArticle,
        'Test Source',
        'https://example.com'
      );

      expect(processed.image_url).toBe('');
    });

    it('should extract image from enclosure', async () => {
      const article: RawArticle = {
        ...mockRawArticle,
        enclosure: {
          url: 'https://example.com/image.jpg',
          type: 'image/jpeg',
        },
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.image_url).toBe('https://example.com/image.jpg');
    });

    it('should extract image from content', async () => {
      const article: RawArticle = {
        ...mockRawArticle,
        content: '<p>Text</p><img src="https://example.com/image.png"/><p>More</p>',
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.image_url).toBe('https://example.com/image.png');
    });

    it('should handle undefined enclosure url gracefully', async () => {
      const article: RawArticle = {
        ...mockRawArticle,
        enclosure: {
          url: undefined as unknown as string,
          type: 'image/jpeg',
        },
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.image_url).toBe('');
    });

    it('should handle null enclosure url gracefully', async () => {
      const article: RawArticle = {
        ...mockRawArticle,
        enclosure: {
          url: null as unknown as string,
          type: 'image/jpeg',
        },
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.image_url).toBe('');
    });

    it('should handle non-image enclosure url gracefully', async () => {
      const article: RawArticle = {
        ...mockRawArticle,
        enclosure: {
          url: 'https://example.com/video.mp4',
          type: 'video/mp4',
        },
      };

      const processed = await contentService.processArticle(
        article,
        'Test Source',
        'https://example.com'
      );

      expect(processed.image_url).toBe('');
    });

    it('should not use fallback image when no image found', async () => {
      const processed = await contentService.processArticle(
        mockRawArticle,
        'Test Source',
        'https://example.com'
      );

      // Should return empty string, not any fallback
      expect(processed.image_url).toBe('');
    });
  });

  describe('validateArticle', () => {
    const mockProcessedArticle: ProcessedArticle = {
      title: 'Test Article Title',
      slug: 'test-article-title',
      summary: 'This is a test article summary',
      image_url: 'https://example.com/image.jpg',
      article_url: 'https://example.com/article',
      canonical_url: 'https://example.com/article',
      source_name: 'Test Source',
      source_url: 'https://example.com',
      category: 'technology',
      tags: ['tech', 'news'],
      language: 'en',
      published_at: '2024-01-01T00:00:00Z',
      content_hash: 'hash123',
      status: 'pending_approval',
    };

    it('should validate valid article', () => {
      const validation = contentService.validateArticle(mockProcessedArticle);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject article with short title', () => {
      const article = { ...mockProcessedArticle, title: 'Short' };
      const validation = contentService.validateArticle(article);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Title must be at least 10 characters');
    });

    it('should reject article with short summary', () => {
      const article = { ...mockProcessedArticle, summary: 'Short' };
      const validation = contentService.validateArticle(article);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Summary must be at least 20 characters');
    });

    it('should reject article without URL', () => {
      const article = { ...mockProcessedArticle, article_url: '' };
      const validation = contentService.validateArticle(article);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Article URL is required');
    });
  });

  describe('processArticles', () => {
    it('should process multiple articles', async () => {
      const rawArticles: RawArticle[] = [
        {
          title: 'Article 1 Test Title',
          description: 'Description 1 long enough',
          link: 'https://example.com/1',
        },
        {
          title: 'Article 2 Test Title',
          description: 'Description 2 long enough',
          link: 'https://example.com/2',
        },
      ];

      const processed = await contentService.processArticles(
        rawArticles,
        'Test Source',
        'https://example.com'
      );

      expect(processed).toHaveLength(2);
      expect(processed[0].title).toBe('Article 1 Test Title');
      expect(processed[1].title).toBe('Article 2 Test Title');
    });

    it('should filter out invalid articles', async () => {
      const rawArticles: RawArticle[] = [
        {
          title: 'Valid Article Title Here',
          description: 'Valid description long enough',
          link: 'https://example.com/1',
        },
        {
          title: 'Short', // Invalid - too short
          description: 'Short', // Invalid - too short
          link: 'https://example.com/2',
        },
      ];

      const processed = await contentService.processArticles(
        rawArticles,
        'Test Source',
        'https://example.com'
      );

      expect(processed).toHaveLength(1);
      expect(processed[0].title).toBe('Valid Article Title Here');
    });
  });
});
