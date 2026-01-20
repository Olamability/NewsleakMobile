import { RSSService } from '../rss.service';
import { RawArticle } from '../../types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

describe('RSSService', () => {
  let rssService: RSSService;

  beforeEach(() => {
    rssService = new RSSService();
    jest.clearAllMocks();
  });

  describe('isValidFeedUrl', () => {
    it('should validate valid HTTP URLs', () => {
      expect(RSSService.isValidFeedUrl('http://example.com/feed.xml')).toBe(true);
    });

    it('should validate valid HTTPS URLs', () => {
      expect(RSSService.isValidFeedUrl('https://example.com/feed.xml')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(RSSService.isValidFeedUrl('ftp://example.com/feed.xml')).toBe(false);
      expect(RSSService.isValidFeedUrl('not-a-url')).toBe(false);
      expect(RSSService.isValidFeedUrl('')).toBe(false);
    });
  });

  describe('deduplicateArticles', () => {
    it('should remove duplicate articles by URL and title', () => {
      const articles: RawArticle[] = [
        {
          title: 'Test Article 1',
          link: 'https://example.com/article1',
        },
        {
          title: 'Test Article 1',
          link: 'https://example.com/article1',
        },
        {
          title: 'Test Article 2',
          link: 'https://example.com/article2',
        },
      ];

      const deduplicated = RSSService.deduplicateArticles(articles);
      expect(deduplicated).toHaveLength(2);
      expect(deduplicated[0].title).toBe('Test Article 1');
      expect(deduplicated[1].title).toBe('Test Article 2');
    });

    it('should keep articles with same title but different URLs', () => {
      const articles: RawArticle[] = [
        {
          title: 'Same Title',
          link: 'https://example.com/article1',
        },
        {
          title: 'Same Title',
          link: 'https://example.com/article2',
        },
      ];

      const deduplicated = RSSService.deduplicateArticles(articles);
      expect(deduplicated).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const deduplicated = RSSService.deduplicateArticles([]);
      expect(deduplicated).toHaveLength(0);
    });
  });

  describe('parseFeed', () => {
    it('should parse RSS feed via backend API', async () => {
      const mockArticles: RawArticle[] = [
        {
          title: 'Test Article',
          link: 'https://example.com/article',
          description: 'Test description',
          pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
        },
      ];

      // Mock axios.post to return the backend response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          articles: mockArticles,
          feedMetadata: {
            title: 'Test Feed',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'https://test.supabase.co/functions/v1/parse-rss',
          method: 'post',
          headers: {},
        },
      });

      const articles = await rssService.parseFeed('https://example.com/feed.xml');
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Test Article');
      expect(articles[0].link).toBe('https://example.com/article');
      expect(articles[0].description).toBe('Test description');
      
      // Verify the backend was called
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/parse-rss',
        expect.objectContaining({
          feedUrl: 'https://example.com/feed.xml',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'apikey': 'test-anon-key',
          }),
        })
      );
    });

    it('should handle backend API errors', async () => {
      // Mock axios.post to return an error response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: false,
          articles: [],
          error: 'Failed to parse RSS feed',
        },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          url: 'https://test.supabase.co/functions/v1/parse-rss',
          method: 'post',
          headers: {},
        },
      });

      await expect(rssService.parseFeed('https://example.com/feed.xml')).rejects.toThrow();
    }, 10000); // Increase timeout for retry logic

    it('should retry on network errors', async () => {
      // Mock network error on first attempt, success on second
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            success: true,
            articles: [
              {
                title: 'Test Article',
                link: 'https://example.com/article',
              },
            ],
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {
            url: 'https://test.supabase.co/functions/v1/parse-rss',
            method: 'post',
            headers: {},
          },
        });

      const articles = await rssService.parseFeed('https://example.com/feed.xml');
      expect(articles).toHaveLength(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    }, 10000); // Increase timeout for retry logic

    it('should throw error after max retries', async () => {
      // Mock network error for all attempts
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(rssService.parseFeed('https://example.com/feed.xml')).rejects.toThrow(
        'Failed to parse RSS feed after 3 attempts'
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    }, 15000); // Increase timeout for retry logic (3 retries with delays)
  });

  describe('getFeedMetadata', () => {
    it('should extract feed metadata via backend API', async () => {
      const mockMetadata = {
        title: 'Test Feed Title',
        description: 'Test Feed Description',
        link: 'https://example.com',
        language: 'en',
      };

      // Mock axios.post to return the backend response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          articles: [],
          feedMetadata: mockMetadata,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'https://test.supabase.co/functions/v1/parse-rss',
          method: 'post',
          headers: {},
        },
      });

      const metadata = await rssService.getFeedMetadata('https://example.com/feed.xml');
      expect(metadata.title).toBe('Test Feed Title');
      expect(metadata.description).toBe('Test Feed Description');
      expect(metadata.link).toBe('https://example.com');
      expect(metadata.language).toBe('en');
      
      // Verify the backend was called
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/parse-rss',
        expect.objectContaining({
          feedUrl: 'https://example.com/feed.xml',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'apikey': 'test-anon-key',
          }),
        })
      );
    });
  });
});
