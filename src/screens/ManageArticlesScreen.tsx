import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { AdminService } from '../services/admin.service';
import { NewsArticle } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface ManageArticlesScreenProps {
  navigation: any;
}

export const ManageArticlesScreen: React.FC<ManageArticlesScreenProps> = ({ navigation }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }

      const response = await AdminService.getAllArticles(isRefresh ? 1 : page);

      if (isRefresh) {
        setArticles(response.data);
        setPage(1);
      } else {
        setArticles(response.data);
      }

      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading articles:', error);
      Alert.alert('Error', 'Failed to load articles. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleFeatureArticle = (articleId: string, isFeatured: boolean) => {
    Alert.alert(
      isFeatured ? 'Unfeature Article' : 'Feature Article',
      isFeatured
        ? 'Remove this article from featured section?'
        : 'Add this article to featured section?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const newFeaturedStatus = !isFeatured;
              const response = await AdminService.toggleArticleFeaturedStatus(
                articleId,
                newFeaturedStatus
              );

              if (response.error) {
                Alert.alert('Error', response.error);
                return;
              }

              setArticles((prevArticles) =>
                prevArticles.map((article) =>
                  article.id === articleId
                    ? { ...article, is_featured: newFeaturedStatus }
                    : article
                )
              );
            } catch (error) {
              console.error('Error toggling featured status:', error);
              Alert.alert('Error', 'Failed to update article. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRemoveArticle = (articleId: string) => {
    Alert.alert(
      'Remove Article',
      'Are you sure you want to remove this article? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await AdminService.deleteArticle(articleId);

              if (response.error) {
                Alert.alert('Error', response.error);
                return;
              }

              setArticles((prevArticles) =>
                prevArticles.filter((article) => article.id !== articleId)
              );

              Alert.alert('Success', 'Article removed successfully');
            } catch (error) {
              console.error('Error removing article:', error);
              Alert.alert('Error', 'Failed to remove article. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadArticles(true);
  };

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <View style={styles.articleCard}>
      <View style={styles.articleInfo}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.articleSource}>{item.source_name}</Text>
        {item.is_featured && <Text style={styles.featuredBadge}>⭐ Featured</Text>}
      </View>
      <View style={styles.articleActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.featureButton]}
          onPress={() => handleFeatureArticle(item.id, item.is_featured || false)}
        >
          <Text style={styles.actionButtonText}>{item.is_featured ? 'Unfeature' : 'Feature'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemoveArticle(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Articles</Text>
        </View>
        <EmptyState
          icon="📄"
          title="No Articles to Manage"
          message="Articles will appear here once ingestion starts"
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Articles</Text>
        <Text style={styles.headerSubtitle}>{articles.length} total articles</Text>
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
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.background,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
  },
  articleCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  articleInfo: {
    marginBottom: SPACING.md,
  },
  articleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  articleSource: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  featuredBadge: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  articleActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  featureButton: {
    backgroundColor: COLORS.primary,
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.background,
  },
  removeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
});
