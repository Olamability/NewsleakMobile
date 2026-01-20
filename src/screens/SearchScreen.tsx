import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '../components/SearchBar';
import { NewsCard } from '../components/NewsCard';
import { RecentSearchChip } from '../components/RecentSearchChip';
import { TrendingTopicChip } from '../components/TrendingTopicChip';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { NewsArticle } from '../types/news';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { debounce } from '../utils/helpers';
import {
  useSearchArticles,
  useTrendingTopics,
  useRecentSearches,
  useSaveSearch,
  useDeleteSearch,
  useTrackEvent,
} from '../lib/queries';
import { RootStackParamList } from '../navigation/types';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const { data: searchResults, isLoading: searchLoading } = useSearchArticles(activeQuery);
  const { data: trendingTopics, isLoading: trendingLoading } = useTrendingTopics();
  const { data: recentSearches, isLoading: recentLoading } = useRecentSearches();
  const { mutate: saveSearch } = useSaveSearch();
  const { mutate: deleteSearch } = useDeleteSearch();
  const { mutate: trackEvent } = useTrackEvent();

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setActiveQuery(query);
      if (query.length >= 2) {
        saveSearch({ query });
      }
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    setActiveQuery(query);
    trackEvent({
      eventType: 'search',
      metadata: { query, source: 'recent' },
    });
  };

  const handleTrendingTopicPress = (topic: string) => {
    setSearchQuery(topic);
    setActiveQuery(topic);
    saveSearch({ query: topic });
    trackEvent({
      eventType: 'search',
      metadata: { query: topic, source: 'trending' },
    });
  };

  const handleDeleteRecentSearch = (id: string) => {
    deleteSearch(id);
  };

  const handleArticlePress = (article: NewsArticle) => {
    trackEvent({ eventType: 'article_view', articleId: article.id });
    navigation.navigate('ArticleDetail', { articleId: article.id });
  };

  const renderContent = () => {
    if (searchLoading && activeQuery.length >= 2) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner />
        </View>
      );
    }

    if (activeQuery.length >= 2 && searchResults) {
      if (searchResults.length === 0) {
        return (
          <EmptyState
            title="No Results Found"
            message={`No articles found for "${activeQuery}"`}
          />
        );
      }

      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NewsCard article={item} onPress={() => handleArticlePress(item)} />
          )}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    return (
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recent Searches */}
        {!recentLoading && recentSearches && recentSearches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.chipContainer}>
              {recentSearches.map((search) => (
                <RecentSearchChip
                  key={search.id}
                  query={search.query}
                  onPress={() => handleRecentSearchPress(search.query)}
                  onDelete={() => handleDeleteRecentSearch(search.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Trending Topics */}
        {!trendingLoading && trendingTopics && trendingTopics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            <View style={styles.chipContainer}>
              {trendingTopics.map((topic) => (
                <TrendingTopicChip
                  key={topic.id}
                  topic={topic.topic}
                  count={topic.search_count}
                  onPress={() => handleTrendingTopicPress(topic.topic)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search news..."
        />
      </View>
      {renderContent()}
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
});
