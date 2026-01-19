import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { NewsService } from '../services/news.service';
import { BookmarkService } from '../services/bookmark.service';
import { NewsArticle } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Popular news sources
  const newsSources = [
    { id: 'all', name: 'All', icon: '📰' },
    { id: 'bbc', name: 'BBC News', icon: '🌐' },
    { id: 'cnn', name: 'CNN', icon: '📺' },
    { id: 'reuters', name: 'Reuters', icon: '📡' },
    { id: 'ap', name: 'AP News', icon: '📰' },
    { id: 'guardian', name: 'The Guardian', icon: '📰' },
    { id: 'nyt', name: 'NY Times', icon: '📰' },
  ];

  // Extract first name from user email or use default
  const getGreeting = () => {
    if (user?.email) {
      const name = user.email.split('@')[0];
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      return `Welcome back, ${capitalizedName}!`;
    }
    return 'Welcome back!';
  };

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.headerSubtitle}>Discover a world of news that matters to you</Text>
      </View>

      {/* Horizontal News Sources Scroller */}
      <View style={styles.sourcesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sourcesScrollContent}
        >
          {newsSources.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={[
                styles.sourceChip,
                selectedSource === source.id && styles.sourceChipActive,
              ]}
              onPress={() => setSelectedSource(source.id)}
            >
              <Text style={styles.sourceIcon}>{source.icon}</Text>
              <Text
                style={[
                  styles.sourceText,
                  selectedSource === source.id && styles.sourceTextActive,
                ]}
              >
                {source.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending news</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 24,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  sourcesContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sourcesScrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sourceChipActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  sourceIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  sourceText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  sourceTextActive: {
    color: COLORS.background,
  },
});
