import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import { TrendingService } from '../services/trending.service';
import {
  NewsArticle,
  Category,
  NewsSource,
  SponsoredContent,
  TrendingTopic,
  RecentSearch,
} from '../types/news';

const ITEMS_PER_PAGE = 20;

export const useNewsSources = () => {
  return useQuery({
    queryKey: ['news-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as NewsSource[];
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useNewsFeed = (categoryId?: string, sourceId?: string) => {
  return useInfiniteQuery({
    queryKey: ['news-feed', categoryId, sourceId],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('news_articles')
        .select(
          `
          *,
          news_sources (
            id,
            name,
            logo_url
          )
        `
        )
        .order('published_at', { ascending: false })
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);

      if (categoryId && categoryId !== 'all' && categoryId !== 'for-you') {
        // Filter by category slug (text field) instead of category_id (uuid field)
        // The categoryId parameter is actually a category slug
        query = query.eq('category', categoryId);
      }

      if (sourceId) {
        query = query.eq('source_id', sourceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NewsArticle[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < ITEMS_PER_PAGE) return undefined;
      return allPages.length;
    },
  });
};

export const useBreakingNews = (limit: number = 5) => {
  return useQuery({
    queryKey: ['breaking-news', limit],
    queryFn: async () => {
      return await TrendingService.detectBreakingNews(limit);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useSponsoredContent = () => {
  return useQuery({
    queryKey: ['sponsored-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsored_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as SponsoredContent[];
    },
    staleTime: 1000 * 60 * 30,
  });
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select(
          `
          *,
          news_sources (
            id,
            name,
            logo_url,
            website_url
          ),
          categories (
            id,
            name,
            slug
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as NewsArticle;
    },
  });
};

export const useSearchArticles = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('news_articles')
        .select(
          `
          *,
          news_sources (
            id,
            name,
            logo_url
          )
        `
        )
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as NewsArticle[];
    },
    enabled: query.length >= 2,
  });
};

export const useTrendingTopics = () => {
  return useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('search_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as TrendingTopic[];
    },
    staleTime: 1000 * 60 * 15,
  });
};

export const useTrendingArticles = (limit: number = 10) => {
  return useQuery({
    queryKey: ['trending-articles', limit],
    queryFn: async () => {
      return await TrendingService.getTrendingArticles(limit);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};

export const useCategoryTrendingArticles = (category: string, limit: number = 5) => {
  return useQuery({
    queryKey: ['category-trending', category, limit],
    queryFn: async () => {
      return await TrendingService.getCategoryTrendingArticles(category, limit);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!category,
  });
};

export const useTrendingTopicsFromService = (limit: number = 10) => {
  return useQuery({
    queryKey: ['trending-topics-service', limit],
    queryFn: async () => {
      return await TrendingService.getTrendingTopics(limit);
    },
    staleTime: 1000 * 60 * 15,
  });
};

export const useRecentSearches = (userId?: string) => {
  return useQuery({
    queryKey: ['recent-searches', userId],
    queryFn: async () => {
      let query = supabase
        .from('recent_searches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as RecentSearch[];
    },
  });
};

export const useTrackEvent = () => {
  return useMutation({
    mutationFn: async ({
      eventType,
      articleId,
      metadata,
    }: {
      eventType: string;
      articleId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { error } = await supabase.from('analytics_events').insert({
        event_type: eventType,
        article_id: articleId || null,
        metadata: (metadata as Record<string, any>) || null,
      } as any);

      if (error) throw error;
    },
  });
};

export const useSaveSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ query, userId }: { query: string; userId?: string }) => {
      const { error } = await supabase.from('recent_searches').insert({
        query,
        user_id: userId || null,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] });
    },
  });
};

export const useDeleteSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('recent_searches').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] });
    },
  });
};

// =============================================
// ENGAGEMENT HOOKS (Likes & Comments)
// =============================================

import { EngagementService } from '../services/engagement.service';

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleId, userId }: { articleId: string; userId?: string }) => {
      return await EngagementService.toggleLike(articleId, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate article engagement queries
      queryClient.invalidateQueries({ queryKey: ['article-engagement', variables.articleId] });
      queryClient.invalidateQueries({ queryKey: ['news-feed'] });
    },
  });
};

export const useArticleEngagement = (articleId: string, userId?: string) => {
  return useQuery({
    queryKey: ['article-engagement', articleId, userId],
    queryFn: async () => {
      const [likeCount, commentCount, isLiked] = await Promise.all([
        EngagementService.getLikeCount(articleId),
        EngagementService.getCommentCount(articleId),
        EngagementService.isLiked(articleId, userId),
      ]);

      return { likeCount, commentCount, isLiked };
    },
  });
};

export const useArticleComments = (articleId: string) => {
  return useQuery({
    queryKey: ['article-comments', articleId],
    queryFn: async () => {
      return await EngagementService.getComments(articleId);
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleId,
      content,
      userId,
    }: {
      articleId: string;
      content: string;
      userId?: string;
    }) => {
      return await EngagementService.addComment(articleId, content, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['article-comments', variables.articleId] });
      queryClient.invalidateQueries({ queryKey: ['article-engagement', variables.articleId] });
    },
  });
};
