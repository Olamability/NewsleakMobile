import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from './supabase';
import {
  NewsArticle,
  Category,
  SponsoredContent,
  TrendingTopic,
  RecentSearch,
} from '../types/news';

const ITEMS_PER_PAGE = 20;

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

export const useNewsFeed = (categoryId?: string) => {
  return useInfiniteQuery({
    queryKey: ['news-feed', categoryId],
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

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
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

export const useBreakingNews = () => {
  return useQuery({
    queryKey: ['breaking-news'],
    queryFn: async () => {
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
        .eq('is_breaking', true)
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as NewsArticle[];
    },
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
      metadata?: Record<string, any>;
    }) => {
      const { error } = await supabase.from('analytics_events').insert({
        event_type: eventType,
        article_id: articleId || null,
        metadata: metadata || null,
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
