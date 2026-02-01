import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { CategoryPill } from '../components/CategoryPill';
import { BreakingNewsCard } from '../components/BreakingNewsCard';
import { SponsoredCard } from '../components/SponsoredCard';
import { SearchBar } from '../components/SearchBar';
import { NewsSourceCircle } from '../components/NewsSourceCircle';
import { NewsArticle, SponsoredContent } from '../types/news';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import {
  useNewsFeed,
  useBreakingNews,
  useSponsoredContent,
  useTrackEvent,
  useNewsSources,
} from '../lib/queries';
import { RootStackParamList } from '../navigation/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logoImage = require('../../assets/icon.png') as ImageSourcePropType;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const SPONSORED_INTERVAL = 6;

// Fixed categories for the homepage matching the design
const FIXED_CATEGORIES = [
  { id: 'trending', name: 'Trending' },
  { id: 'for-you', name: 'For you' },
  { id: '3', name: 'Politics' },
  { id: '5', name: 'Sports' },
  { id: '7', name: 'Entertainment' },
];

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('for-you');
  const [currentBreakingIndex, setCurrentBreakingIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const { data: breakingNews, isLoading: breakingLoading } = useBreakingNews();
  const { data: sponsoredContent, isLoading: _sponsoredLoading } = useSponsoredContent();
  const { data: newsSources, isLoading: _sourcesLoading } = useNewsSources();
  const { mutate: trackEvent } = useTrackEvent();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNewsFeed(selectedCategory, selectedSource || undefined);

  const allArticles = useMemo(() => {
    if (!data) return [];
    // Flatten all pages and deduplicate by article ID
    const articles = data.pages.flatMap((page) => page);
    const uniqueArticles = Array.from(
      new Map(articles.map((article) => [article.id, article])).values()
    );
    return uniqueArticles;
  }, [data]);

  const feedItems = useMemo(() => {
    const items: Array<{ type: 'article' | 'sponsored'; data: NewsArticle | SponsoredContent }> =
      [];
    const sponsored = sponsoredContent || [];
    let sponsoredIndex = 0;

    allArticles.forEach((article, index) => {
      items.push({ type: 'article', data: article });

      if ((index + 1) % SPONSORED_INTERVAL === 0 && sponsored[sponsoredIndex]) {
        items.push({ type: 'sponsored', data: sponsored[sponsoredIndex] });
        sponsoredIndex = (sponsoredIndex + 1) % sponsored.length;
      }
    });

    return items;
  }, [allArticles, sponsoredContent]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSourcePress = useCallback((sourceId: string) => {
    // Toggle source selection - if already selected, deselect it
    setSelectedSource((prev) => (prev === sourceId ? null : sourceId));
  }, []);

  const handleArticlePress = useCallback(
    (article: NewsArticle) => {
      trackEvent({ eventType: 'article_view', articleId: article.id });
      navigation.navigate('ArticleDetail', { articleId: article.id });
    },
    [navigation, trackEvent]
  );

  const handleBreakingScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + SPACING.lg));
    setCurrentBreakingIndex(index);
  }, []);

  const handleSearchPress = useCallback(() => {
    // Navigate to the Search screen in the stack navigator
    navigation.navigate('Search');
  }, [navigation]);

  const handleCityPress = useCallback(() => {
    // TODO: Implement city selection functionality
    // For now, this is a placeholder that could show a city picker modal
    console.warn('City selector pressed - feature to be implemented');
  }, []);

  const handleViewMoreHeadlines = useCallback(() => {
    // TODO: Navigate to full headlines view or filter by breaking news
    // For now, set category to show breaking/trending news
    setSelectedCategory('trending');
  }, []);

  if (isLoading && !allArticles.length) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError && !allArticles.length) {
    return (
      <ErrorState message={(error as Error)?.message || 'Failed to load news'} onRetry={refetch} />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Logo, City Selector, Search and Notification Icons */}
      <View style={styles.header}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        
        {/* City Selector */}
        <TouchableOpacity style={styles.citySelector} onPress={handleCityPress}>
          <Text style={styles.cityText}>Choose Your City</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.headerText} />
        </TouchableOpacity>
        
        {/* Search and Notification Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleSearchPress} style={styles.iconButton}>
            <Ionicons name="search" size={24} color={COLORS.headerText} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')} 
            style={styles.iconButton}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.headerText} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={feedItems}
        keyExtractor={(item) => {
          if (item.type === 'sponsored') {
            return `sponsored-${(item.data as SponsoredContent).id}`;
          }
          return `article-${(item.data as NewsArticle).id}`;
        }}
        renderItem={({ item }) => {
          if (item.type === 'sponsored') {
            return (
              <SponsoredCard
                content={item.data as SponsoredContent}
                onPress={() => {
                  trackEvent({
                    eventType: 'sponsored_click',
                    metadata: { sponsored_id: (item.data as SponsoredContent).id },
                  });
                }}
              />
            );
          }
          return (
            <NewsCard
              article={item.data as NewsArticle}
              onPress={() => handleArticlePress(item.data as NewsArticle)}
            />
          );
        }}
        ListHeaderComponent={
          <>
            {/* News Sources Row */}
            {newsSources && newsSources.length > 0 && (
              <View style={styles.sourcesContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sourcesContent}
                >
                  {newsSources.slice(0, 10).map((source) => (
                    <NewsSourceCircle
                      key={source.id}
                      name={source.name}
                      logoUrl={source.logo_url}
                      onPress={() => handleSourcePress(source.id)}
                      isActive={selectedSource === source.id}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContent}
              >
                {FIXED_CATEGORIES.map((category) => (
                  <CategoryPill
                    key={category.id}
                    label={category.name}
                    isActive={selectedCategory === category.id}
                    onPress={() => setSelectedCategory(category.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Featured Headlines (Breaking News) */}
            {!breakingLoading && breakingNews && breakingNews.length > 0 && (
              <View style={styles.breakingSection}>
                <View style={styles.headlineHeader}>
                  <Text style={styles.sectionTitle}>Featured Headlines</Text>
                  <TouchableOpacity onPress={handleViewMoreHeadlines}>
                    <Text style={styles.seeMore}>View more {'>'}</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleBreakingScroll}
                  scrollEventThrottle={16}
                  snapToInterval={CARD_WIDTH + SPACING.lg}
                  decelerationRate="fast"
                  contentContainerStyle={styles.breakingContent}
                >
                  {breakingNews.map((article) => (
                    <BreakingNewsCard
                      key={article.id}
                      article={article}
                      onPress={() => handleArticlePress(article)}
                    />
                  ))}
                </ScrollView>
                <View style={styles.pagination}>
                  {breakingNews.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.dot, index === currentBreakingIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <LoadingSpinner size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="No Articles Yet"
              message="New stories are on the way! Pull down to refresh and check for the latest news."
              actionLabel="Refresh"
              onAction={handleRefresh}
            />
          ) : null
        }
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.headerBackground,
    gap: SPACING.sm,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
    gap: SPACING.xs,
  },
  cityText: {
    color: COLORS.headerText,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: SPACING.md,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  sourcesContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sourcesContent: {
    paddingHorizontal: SPACING.xs,
  },
  categoriesContainer: {
    marginVertical: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.xs,
  },
  breakingSection: {
    marginBottom: SPACING.lg,
  },
  headlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeMore: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  breakingContent: {
    paddingRight: SPACING.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.text,
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});
