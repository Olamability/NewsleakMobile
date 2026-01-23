import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { NewsService } from '../services/news.service';
import { BookmarkService } from '../services/bookmark.service';
import { NewsArticle } from '../types';
import { COLORS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { getCategoryBySlug } from '../constants/categories';
import { RootStackParamList } from '../navigation/types';

interface CategoryFeedScreenProps {
  route: RouteProp<RootStackParamList, 'CategoryFeed'>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export const CategoryFeedScreen: React.FC<CategoryFeedScreenProps> = ({ route, navigation }) => {
  const { category, categoryName } = route.params;
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const categoryData = getCategoryBySlug(category);

  const loadArticles = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setIsLoading(true);
        }
        setError(null);

        const response = await NewsService.getArticles(pageNum, 20, category);

        if (pageNum === 1) {
          setArticles(response.data);
        } else {
          setArticles((prev) => [...prev, ...response.data]);
        }

        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Failed to load articles');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [category]
  );

  useEffect(() => {
    loadArticles();
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [loadArticles, isAuthenticated]);

  const loadBookmarks = async () => {
    try {
      const bookmarks = await BookmarkService.getBookmarks();
      const ids = new Set(bookmarks.map((article) => article.id));
      setBookmarkedIds(ids);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadArticles(1, true);
  }, [loadArticles]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      loadArticles(page + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, page, loadArticles]);

  const handleArticlePress = (article: NewsArticle) => {
    navigation.navigate('ArticleDetail', { articleId: article.id });
  };

  const handleBookmarkPress = async (article: NewsArticle) => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }

    try {
      const isBookmarked = bookmarkedIds.has(article.id);

      if (isBookmarked) {
        await BookmarkService.removeBookmark(article.id);
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(article.id);
          return newSet;
        });
      } else {
        await BookmarkService.addBookmark(article.id);
        setBookmarkedIds((prev) => new Set(prev).add(article.id));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <NewsCard
      article={item as any}
      onPress={() => handleArticlePress(item)}
      onBookmarkPress={() => handleBookmarkPress(item)}
      isBookmarked={bookmarkedIds.has(item.id)}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  if (isLoading && articles.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  if (error && articles.length === 0) {
    return <ErrorState message={error} onRetry={() => loadArticles(1)} />;
  }

  if (!isLoading && articles.length === 0) {
    return (
      <EmptyState
        icon={categoryData?.icon || '📰'}
        title="No Articles Found"
        message={`No articles found in ${categoryName}`}
        actionLabel="Refresh"
        onAction={() => loadArticles(1)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});
