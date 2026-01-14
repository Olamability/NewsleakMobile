import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { NewsService } from '../services/news.service';
import { BookmarkService } from '../services/bookmark.service';
import { NewsArticle } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadArticles();
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [isAuthenticated]);

  const loadArticles = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1 && !isRefresh) {
        setIsLoading(true);
      }
      setError(null);

      const response = await NewsService.getArticles(pageNum, 20);

      if (pageNum === 1) {
        setArticles(response.data);
      } else {
        setArticles((prev) => [...prev, ...response.data]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to load articles');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

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
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      loadArticles(page + 1);
    }
  }, [isLoadingMore, hasMore, isLoading, page]);

  const handleArticlePress = (article: NewsArticle) => {
    navigation.navigate('ArticleDetail', { article });
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
      article={item}
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
    return (
      <ErrorState
        message={error}
        onRetry={() => loadArticles(1)}
      />
    );
  }

  if (!isLoading && articles.length === 0) {
    return (
      <EmptyState
        title="No Articles Found"
        message="Check back later for the latest news"
        actionLabel="Refresh"
        onAction={() => loadArticles(1)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📰 Top Stories</Text>
      </View>
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
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.md,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});
