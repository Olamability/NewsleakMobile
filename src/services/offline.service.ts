import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsArticle } from '../types';

const CACHE_PREFIX = 'cached_article_';
const CACHE_INDEX_KEY = 'cached_articles_index';
const MAX_CACHED_ARTICLES = 50;
const CACHE_EXPIRY_DAYS = 7;

export interface CachedArticle extends NewsArticle {
  cached_at: string;
  expires_at: string;
}

export class OfflineService {
  /**
   * Cache an article for offline reading
   */
  static async cacheArticle(article: NewsArticle): Promise<boolean> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + CACHE_EXPIRY_DAYS);

      const cachedArticle: CachedArticle = {
        ...article,
        cached_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
      };

      // Save article
      await AsyncStorage.setItem(`${CACHE_PREFIX}${article.id}`, JSON.stringify(cachedArticle));

      // Update cache index
      await this.updateCacheIndex(article.id, 'add');

      // Cleanup old cache if needed
      await this.cleanupCache();

      return true;
    } catch (error) {
      console.error('Error caching article:', error);
      return false;
    }
  }

  /**
   * Get cached article by ID
   */
  static async getCachedArticle(articleId: string): Promise<CachedArticle | null> {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${articleId}`);
      if (!cached) return null;

      const article: CachedArticle = JSON.parse(cached);

      // Check if expired
      if (new Date(article.expires_at) < new Date()) {
        await this.removeCachedArticle(articleId);
        return null;
      }

      return article;
    } catch (error) {
      console.error('Error getting cached article:', error);
      return null;
    }
  }

  /**
   * Remove cached article
   */
  static async removeCachedArticle(articleId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${articleId}`);
      await this.updateCacheIndex(articleId, 'remove');
    } catch (error) {
      console.error('Error removing cached article:', error);
    }
  }

  /**
   * Get all cached articles
   */
  static async getAllCachedArticles(): Promise<CachedArticle[]> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (!indexStr) return [];

      const index: string[] = JSON.parse(indexStr);
      const articles: CachedArticle[] = [];

      for (const articleId of index) {
        const article = await this.getCachedArticle(articleId);
        if (article) {
          articles.push(article);
        }
      }

      return articles;
    } catch (error) {
      console.error('Error getting all cached articles:', error);
      return [];
    }
  }

  /**
   * Check if article is cached
   */
  static async isArticleCached(articleId: string): Promise<boolean> {
    try {
      const article = await this.getCachedArticle(articleId);
      return article !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update cache index
   */
  private static async updateCacheIndex(
    articleId: string,
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      let index: string[] = indexStr ? JSON.parse(indexStr) : [];

      if (action === 'add') {
        if (!index.includes(articleId)) {
          index.push(articleId);
        }
      } else {
        index = index.filter((id) => id !== articleId);
      }

      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error('Error updating cache index:', error);
    }
  }

  /**
   * Cleanup old cached articles
   */
  private static async cleanupCache(): Promise<void> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (!indexStr) return;

      const index: string[] = JSON.parse(indexStr);

      // Remove expired articles
      for (const articleId of index) {
        const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${articleId}`);
        if (cached) {
          const article: CachedArticle = JSON.parse(cached);
          if (new Date(article.expires_at) < new Date()) {
            await this.removeCachedArticle(articleId);
          }
        }
      }

      // If still over limit, remove oldest
      const currentIndex = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (currentIndex) {
        let remainingIndex: string[] = JSON.parse(currentIndex);

        if (remainingIndex.length > MAX_CACHED_ARTICLES) {
          // Get articles with timestamps
          const articlesWithTime: Array<{ id: string; cached_at: string }> = [];

          for (const articleId of remainingIndex) {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${articleId}`);
            if (cached) {
              const article: CachedArticle = JSON.parse(cached);
              articlesWithTime.push({
                id: articleId,
                cached_at: article.cached_at,
              });
            }
          }

          // Sort by cached_at (oldest first)
          articlesWithTime.sort(
            (a, b) => new Date(a.cached_at).getTime() - new Date(b.cached_at).getTime()
          );

          // Remove oldest articles
          const toRemove = articlesWithTime.slice(0, remainingIndex.length - MAX_CACHED_ARTICLES);

          for (const article of toRemove) {
            await this.removeCachedArticle(article.id);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }

  /**
   * Clear all cached articles
   */
  static async clearAllCache(): Promise<void> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (!indexStr) return;

      const index: string[] = JSON.parse(indexStr);

      for (const articleId of index) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${articleId}`);
      }

      await AsyncStorage.removeItem(CACHE_INDEX_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache size in bytes (approximate)
   */
  static async getCacheSize(): Promise<number> {
    try {
      const indexStr = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (!indexStr) return 0;

      const index: string[] = JSON.parse(indexStr);
      let totalSize = 0;

      for (const articleId of index) {
        const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${articleId}`);
        if (cached) {
          totalSize += cached.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalArticles: number;
    totalSizeBytes: number;
    oldestCachedAt: string | null;
    newestCachedAt: string | null;
  }> {
    try {
      const articles = await this.getAllCachedArticles();

      if (articles.length === 0) {
        return {
          totalArticles: 0,
          totalSizeBytes: 0,
          oldestCachedAt: null,
          newestCachedAt: null,
        };
      }

      const totalSize = await this.getCacheSize();

      // Sort by cached_at
      const sortedArticles = [...articles].sort(
        (a, b) => new Date(a.cached_at).getTime() - new Date(b.cached_at).getTime()
      );

      return {
        totalArticles: articles.length,
        totalSizeBytes: totalSize,
        oldestCachedAt: sortedArticles[0].cached_at,
        newestCachedAt: sortedArticles[sortedArticles.length - 1].cached_at,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalArticles: 0,
        totalSizeBytes: 0,
        oldestCachedAt: null,
        newestCachedAt: null,
      };
    }
  }

  /**
   * Prefetch articles for offline reading
   */
  static async prefetchArticles(articles: NewsArticle[]): Promise<number> {
    let cached = 0;

    for (const article of articles) {
      const success = await this.cacheArticle(article);
      if (success) cached++;
    }

    return cached;
  }
}
