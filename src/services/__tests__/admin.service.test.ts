import { AdminService } from '../admin.service';
import { supabase } from '../supabase';
import { NewsArticle, NewsSource } from '../../types';

jest.mock('../supabase');

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteArticle', () => {
    it('should delete an article successfully', async () => {
      const articleId = 'article-123';

      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      const result = await AdminService.deleteArticle(articleId);

      expect(supabase.from).toHaveBeenCalledWith('news_articles');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', articleId);
      expect(result.message).toBe('Article deleted successfully');
      expect(result.error).toBeUndefined();
    });

    it('should handle delete error', async () => {
      const articleId = 'article-123';
      const errorMessage = 'Database error';

      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: { message: errorMessage } });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      });

      mockDelete.mockReturnValue({
        eq: mockEq,
      });

      const result = await AdminService.deleteArticle(articleId);

      expect(result.error).toBe(errorMessage);
      expect(result.message).toBeUndefined();
    });

    it('should handle exception during delete', async () => {
      const articleId = 'article-123';
      const exceptionMessage = 'Network error';

      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error(exceptionMessage);
      });

      const result = await AdminService.deleteArticle(articleId);

      expect(result.error).toBe(exceptionMessage);
      expect(result.message).toBeUndefined();
    });
  });

  describe('getAllArticles', () => {
    it('should fetch paginated articles', async () => {
      const mockArticles: NewsArticle[] = [
        {
          id: '1',
          title: 'Test Article',
          summary: 'Test summary',
          image_url: 'https://example.com/image.jpg',
          article_url: 'https://example.com/article',
          source_name: 'Test Source',
          category: 'technology',
          published_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
        } as NewsArticle,
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: mockArticles,
        error: null,
        count: 1,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        order: mockOrder,
      });

      mockOrder.mockReturnValue({
        range: mockRange,
      });

      const result = await AdminService.getAllArticles(1, 20);

      expect(result.data).toEqual(mockArticles);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('toggleArticleFeaturedStatus', () => {
    it('should toggle featured status successfully', async () => {
      const articleId = 'article-123';
      const isFeatured = true;

      const mockArticle: Partial<NewsArticle> = {
        id: articleId,
        title: 'Test Article',
        is_featured: isFeatured,
      };

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockArticle, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const result = await AdminService.toggleArticleFeaturedStatus(articleId, isFeatured);

      expect(supabase.from).toHaveBeenCalledWith('news_articles');
      expect(mockUpdate).toHaveBeenCalledWith({ is_featured: isFeatured });
      expect(mockEq).toHaveBeenCalledWith('id', articleId);
      expect(result.data).toEqual(mockArticle);
      expect(result.error).toBeUndefined();
    });
  });

  describe('addSource', () => {
    it('should add a new source successfully', async () => {
      const name = 'BBC News';
      const rssUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
      const websiteUrl = 'https://www.bbc.com/news';

      const mockSource: NewsSource = {
        id: 'source-123',
        name,
        rss_url: rssUrl,
        website_url: websiteUrl,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockSource, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });

      mockInsert.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const result = await AdminService.addSource(name, rssUrl, websiteUrl);

      expect(supabase.from).toHaveBeenCalledWith('news_sources');
      expect(result.data).toEqual(mockSource);
      expect(result.message).toBe('Source added successfully');
      expect(result.error).toBeUndefined();
    });
  });
});
