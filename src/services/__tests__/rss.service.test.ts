import { RSSService } from '../rss.service';
import { RawArticle } from '../../types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

  describe('parseFeedString', () => {
    it('should parse valid RSS 2.0 feed', async () => {
      const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <title>Test Article</title>
              <link>https://example.com/article</link>
              <description>Test description</description>
              <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      const articles = await rssService.parseFeedString(rssFeed);
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Test Article');
      expect(articles[0].link).toBe('https://example.com/article');
      expect(articles[0].description).toBe('Test description');
    });

    it('should parse valid Atom feed', async () => {
      const atomFeed = `<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>Test Feed</title>
          <entry>
            <title>Test Article</title>
            <link href="https://example.com/article"/>
            <summary>Test summary</summary>
            <updated>2024-01-01T00:00:00Z</updated>
          </entry>
        </feed>`;

      const articles = await rssService.parseFeedString(atomFeed);
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Test Article');
    });

    it('should filter out items without title', async () => {
      const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <link>https://example.com/article</link>
              <description>No title</description>
            </item>
            <item>
              <title>Valid Article</title>
              <link>https://example.com/article2</link>
            </item>
          </channel>
        </rss>`;

      const articles = await rssService.parseFeedString(rssFeed);
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Valid Article');
    });

    it('should filter out items without link', async () => {
      const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <title>No Link Article</title>
              <description>No link</description>
            </item>
            <item>
              <title>Valid Article</title>
              <link>https://example.com/article</link>
            </item>
          </channel>
        </rss>`;

      const articles = await rssService.parseFeedString(rssFeed);
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Valid Article');
    });

    it('should throw error for invalid XML', async () => {
      const invalidXml = 'not valid xml';
      await expect(rssService.parseFeedString(invalidXml)).rejects.toThrow();
    });
  });

  describe('getFeedMetadata', () => {
    it('should extract feed metadata', async () => {
      const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed Title</title>
            <description>Test Feed Description</description>
            <link>https://example.com</link>
            <language>en</language>
          </channel>
        </rss>`;

      // Mock axios.get to return the RSS feed
      mockedAxios.get.mockResolvedValueOnce({
        data: rssFeed,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: 'https://example.com/feed.xml',
          method: 'get',
          headers: {},
        },
      });

      const metadata = await rssService.getFeedMetadata('https://example.com/feed.xml');
      expect(metadata.title).toBe('Test Feed Title');
      expect(metadata.description).toBe('Test Feed Description');
      expect(metadata.link).toBe('https://example.com');
      expect(metadata.language).toBe('en');
    });
  });
});
