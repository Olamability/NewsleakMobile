import { IngestionService } from '../ingestion.service';
import { supabase } from '../supabase';
import { NewsSource, IngestionLog } from '../../types';

jest.mock('../supabase');
jest.mock('../rss.service');
jest.mock('../content.service');

describe('IngestionService', () => {
  let ingestionService: IngestionService;

  beforeEach(() => {
    jest.clearAllMocks();
    ingestionService = new IngestionService();
  });

  describe('getIngestionLogs', () => {
    it('should fetch ingestion logs', async () => {
      const mockLogs: IngestionLog[] = [
        {
          id: '1',
          source_id: 'source-1',
          source_name: 'Test Source',
          status: 'success',
          articles_fetched: 10,
          articles_processed: 8,
          articles_duplicates: 2,
          started_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T00:05:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: mockLogs, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      });

      mockSelect.mockReturnValue({
        order: mockOrder,
        limit: mockLimit,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const logs = await ingestionService.getIngestionLogs(50);

      expect(logs).toEqual(mockLogs);
      expect(supabase.from).toHaveBeenCalledWith('ingestion_logs');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('should return empty array on error', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      });

      mockSelect.mockReturnValue({
        order: mockOrder,
        limit: mockLimit,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const logs = await ingestionService.getIngestionLogs(50);

      expect(logs).toEqual([]);
    });
  });

  describe('getIngestionLogsBySource', () => {
    it('should fetch logs for specific source', async () => {
      const mockLogs: IngestionLog[] = [
        {
          id: '1',
          source_id: 'source-1',
          source_name: 'Test Source',
          status: 'success',
          articles_fetched: 10,
          articles_processed: 8,
          articles_duplicates: 2,
          started_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: mockLogs, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        limit: mockLimit,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        order: mockOrder,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const logs = await ingestionService.getIngestionLogsBySource('source-1', 20);

      expect(logs).toEqual(mockLogs);
      expect(mockEq).toHaveBeenCalledWith('source_id', 'source-1');
      expect(mockLimit).toHaveBeenCalledWith(20);
    });
  });

  describe('triggerManualIngestion', () => {
    it('should fetch source and trigger ingestion', async () => {
      const mockSource: NewsSource = {
        id: 'source-1',
        name: 'Test Source',
        rss_url: 'https://example.com/feed.xml',
        website_url: 'https://example.com',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockSource, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      // Mock ingestFromSource
      jest.spyOn(ingestionService, 'ingestFromSource').mockResolvedValue({
        success: true,
        sourceId: 'source-1',
        sourceName: 'Test Source',
        articlesFetched: 10,
        articlesProcessed: 8,
        articlesDuplicates: 2,
        articlesStored: 8,
        errors: [],
        logId: 'log-1',
      });

      const result = await ingestionService.triggerManualIngestion('source-1');

      expect(result.success).toBe(true);
      expect(result.sourceName).toBe('Test Source');
      expect(supabase.from).toHaveBeenCalledWith('news_sources');
    });

    it('should handle source not found', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const result = await ingestionService.triggerManualIngestion('invalid-id');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Source not found');
    });
  });

  describe('ingestFromMultipleSources', () => {
    it('should skip inactive sources', async () => {
      const sources: NewsSource[] = [
        {
          id: 'source-1',
          name: 'Active Source',
          rss_url: 'https://example.com/feed.xml',
          website_url: 'https://example.com',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'source-2',
          name: 'Inactive Source',
          rss_url: 'https://example.com/feed2.xml',
          website_url: 'https://example.com',
          is_active: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      jest.spyOn(ingestionService, 'ingestFromSource').mockResolvedValue({
        success: true,
        sourceId: 'source-1',
        sourceName: 'Active Source',
        articlesFetched: 10,
        articlesProcessed: 8,
        articlesDuplicates: 2,
        articlesStored: 8,
        errors: [],
      });

      const results = await ingestionService.ingestFromMultipleSources(sources);

      expect(results).toHaveLength(1);
      expect(results[0].sourceName).toBe('Active Source');
      expect(ingestionService.ingestFromSource).toHaveBeenCalledTimes(1);
    });
  });

  describe('storeArticles with duplicate URLs', () => {
    it('should handle duplicate original_url gracefully using upsert', async () => {
      const mockArticles = [
        {
          title: 'Test Article',
          slug: 'test-article',
          summary: 'Test summary',
          content_snippet: 'Test snippet',
          image_url: 'https://example.com/image.jpg',
          article_url: 'https://example.com/article',
          canonical_url: 'https://example.com/article',
          source_name: 'Test Source',
          source_url: 'https://example.com',
          category: 'Technology',
          tags: ['tech'],
          language: 'en',
          published_at: '2024-01-01T00:00:00Z',
          content_hash: 'hash123',
          status: 'pending_approval' as const,
        },
      ];

      const mockUpsert = jest.fn().mockResolvedValue({ data: mockArticles, error: null });
      const mockFrom = jest.fn().mockReturnValue({
        upsert: mockUpsert,
      });

      (supabase.from as jest.Mock) = mockFrom;

      // Access private method via reflection for testing
      const storeArticles = (ingestionService as any).storeArticles.bind(ingestionService);
      const result = await storeArticles(mockArticles);

      expect(result).toBe(1);
      expect(mockFrom).toHaveBeenCalledWith('news_articles');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            // Should use canonical_url as original_url for better duplicate detection
            original_url: 'https://example.com/article',
          }),
        ]),
        expect.objectContaining({
          onConflict: 'original_url',
          ignoreDuplicates: true,
        })
      );
    });
  });
});
