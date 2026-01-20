import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FeaturedArticleCard } from '../components/FeaturedArticleCard';
import { NewsSourceCircle } from '../components/NewsSourceCircle';
import { AddSourceModal } from '../components/AddSourceModal';
import { NewsService } from '../services/news.service';
import { BookmarkService } from '../services/bookmark.service';
import { SourceService } from '../services/source.service';
import { NewsArticle, NewsSource } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('for-you');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isAddSourceModalVisible, setIsAddSourceModalVisible] = useState(false);
  const [city, setCity] = useState('Your City');
  const featuredScrollRef = useRef<ScrollView>(null);

  // Tab options
  const tabs = [
    { id: 'following', name: 'Following' },
    { id: 'for-you', name: 'For you' },
    { id: 'local', name: 'Local' },
    { id: 'afcon-2025', name: 'AFCON 2025' },
    { id: 'society', name: 'Society' },
  ];

  useEffect(() => {
    loadInitialData();
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load featured articles, regular articles, and sources in parallel
      const [featuredRes, articlesRes, sourcesRes] = await Promise.all([
        NewsService.getFeaturedArticles(10),
        NewsService.getArticles(1, 20),
        SourceService.getActiveSources(),
      ]);

      setFeaturedArticles(featuredRes);
      setArticles(articlesRes.data);
      setHasMore(articlesRes.hasMore);
      setPage(1);
      
      // Add an "Add Source" option to the sources list
      setNewsSources(sourcesRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
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
    loadInitialData().finally(() => setIsRefreshing(false));
  }, []);

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

  const handleAddSource = async (name: string, rssUrl: string, websiteUrl: string) => {
    const result = await SourceService.addSource(name, rssUrl, websiteUrl);
    if (result.error) {
      throw new Error(result.error);
    }
    // Reload sources
    const sources = await SourceService.getActiveSources();
    setNewsSources(sources);
  };

  const handleFeaturedScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + SPACING.lg));
    setCurrentFeaturedIndex(index);
  };

  if (isLoading && articles.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  if (error && articles.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadInitialData()}
      />
    );
  }

  if (!isLoading && articles.length === 0) {
    return (
      <EmptyState
        title="No Articles Found"
        message="Check back later for the latest news"
        actionLabel="Refresh"
        onAction={() => loadInitialData()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.citySelector}>
            <Text style={styles.logo}>N</Text>
            <TouchableOpacity style={styles.cityButton}>
              <Text style={styles.cityText}>Set {city}</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>⬇</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shopPayButton}>
              <Text style={styles.shopPayText}>ShopPay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* News Sources Carousel */}
      <View style={styles.sourcesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sourcesScrollContent}
        >
          {newsSources.map((source) => (
            <NewsSourceCircle
              key={source.id}
              name={source.name}
              logoUrl={source.logo_url}
              onPress={() => setSelectedSource(source.id)}
              isActive={selectedSource === source.id}
            />
          ))}
          {/* Add Source Button */}
          <TouchableOpacity
            style={styles.addSourceContainer}
            onPress={() => setIsAddSourceModalVisible(true)}
          >
            <View style={styles.addSourceCircle}>
              <Text style={styles.addSourceIcon}>+</Text>
            </View>
            <Text style={styles.addSourceText}>Add Source</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          <TouchableOpacity style={styles.editTabButton}>
            <Text style={styles.editTabIcon}>✎</Text>
          </TouchableOpacity>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.name}
              </Text>
              {selectedTab === tab.id && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Headlines Section */}
        {featuredArticles.length > 0 && (
          <View style={styles.headlinesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Headlines</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See more ›</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={featuredScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleFeaturedScroll}
              scrollEventThrottle={16}
              snapToInterval={CARD_WIDTH + SPACING.lg}
              decelerationRate="fast"
              contentContainerStyle={styles.featuredScrollContent}
            >
              {featuredArticles.map((article) => (
                <FeaturedArticleCard
                  key={article.id}
                  article={article}
                  onPress={() => handleArticlePress(article)}
                />
              ))}
            </ScrollView>
            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {featuredArticles.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentFeaturedIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Regular News Feed */}
        <View style={styles.feedSection}>
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onPress={() => handleArticlePress(article)}
              onBookmarkPress={() => handleBookmarkPress(article)}
              isBookmarked={bookmarkedIds.has(article.id)}
            />
          ))}
          {isLoadingMore && (
            <View style={styles.footer}>
              <LoadingSpinner size="small" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Source Modal */}
      <AddSourceModal
        visible={isAddSourceModalVisible}
        onClose={() => setIsAddSourceModalVisible(false)}
        onAdd={handleAddSource}
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
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dropdownIcon: {
    fontSize: 12,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
  },
  iconText: {
    fontSize: 18,
  },
  shopPayButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: '#5A31F4',
    borderRadius: BORDER_RADIUS.round,
  },
  shopPayText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  sourcesContainer: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  sourcesScrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  addSourceContainer: {
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  addSourceCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addSourceIcon: {
    fontSize: 32,
    color: COLORS.textSecondary,
  },
  addSourceText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 70,
  },
  tabsContainer: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsScrollContent: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  editTabButton: {
    marginRight: SPACING.md,
    paddingVertical: SPACING.md,
  },
  editTabIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginRight: SPACING.lg,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.md,
    right: SPACING.md,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  scrollView: {
    flex: 1,
  },
  headlinesSection: {
    paddingTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  featuredScrollContent: {
    paddingRight: SPACING.lg,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.text,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});
