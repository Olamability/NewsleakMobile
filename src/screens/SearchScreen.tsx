import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Input } from '../components/Input';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { NewsService } from '../services/news.service';
import { BookmarkService } from '../services/bookmark.service';
import { NewsArticle } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface SearchScreenProps {
  navigation: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      setHasSearched(true);
      const response = await NewsService.searchArticles(searchQuery.trim());
      setArticles(response.data);

      if (isAuthenticated) {
        const bookmarks = await BookmarkService.getBookmarks();
        const ids = new Set(bookmarks.map((article) => article.id));
        setBookmarkedIds(ids);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search News</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search for news..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!searchQuery.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : hasSearched && articles.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="No Results Found"
          message={`No articles found for "${searchQuery}"`}
        />
      ) : !hasSearched ? (
        <EmptyState
          icon="🔍"
          title="Search for News"
          message="Enter keywords to find articles"
        />
      ) : (
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.lg,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.5,
  },
  searchButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
  },
});
