import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { timeAgo } from '../lib/helpers';
import {
  useArticle,
  useTrackEvent,
  useNewsFeed,
  useArticleEngagement,
  useToggleLike,
  useArticleComments,
  useAddComment,
} from '../lib/queries';
import { RootStackParamList } from '../navigation/types';
import { NewsCard } from '../components/NewsCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NewsArticle } from '../types/news';

type ArticleDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ArticleDetail'
>;
type ArticleDetailScreenRouteProp = RouteProp<RootStackParamList, 'ArticleDetail'>;

interface ArticleDetailScreenProps {
  navigation: ArticleDetailScreenNavigationProp;
  route: ArticleDetailScreenRouteProp;
}

// Memoized component for rendering related news items to improve performance
const RelatedNewsItem = React.memo<{
  item: NewsArticle;
  onPress: (article: NewsArticle) => void;
}>(({ item, onPress }) => {
  return <NewsCard article={item} onPress={() => onPress(item)} />;
});

RelatedNewsItem.displayName = 'RelatedNewsItem';

export const ArticleDetailScreen: React.FC<ArticleDetailScreenProps> = ({ navigation, route }) => {
  const { articleId } = route.params;
  const { data: article, isLoading, error } = useArticle(articleId);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { mutate: trackEvent } = useTrackEvent();
  const { data: engagement } = useArticleEngagement(articleId);
  const { mutate: toggleLike } = useToggleLike();
  const { data: comments } = useArticleComments(articleId);
  const { mutate: addComment } = useAddComment();

  // Get related news - using 'all' category to get general news feed
  const {
    data: relatedNewsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNewsFeed('all');

  // Filter out the current article from related news and optimize performance
  const relatedNews = useMemo(() => {
    if (!relatedNewsData) return [];
    const allArticles = relatedNewsData.pages.flatMap((page) => page);
    // Remove duplicates based on ID using a Map
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.id, article])).values()
    );
    // Filter out current article, then limit to 20 items
    return uniqueArticles.filter((item) => item.id !== articleId).slice(0, 20);
  }, [relatedNewsData, articleId]);

  const trackArticleView = useCallback(() => {
    if (article) {
      trackEvent({
        eventType: 'article_view',
        articleId: article.id,
        metadata: { source: article.news_sources?.name },
      });
    }
  }, [article, trackEvent]);

  useEffect(() => {
    trackArticleView();
  }, [trackArticleView]);

  const handleLikePress = () => {
    toggleLike({ articleId });
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      addComment({ articleId, content: commentText.trim() });
      setCommentText('');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load article</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleReadFullStory = async () => {
    try {
      trackEvent({
        eventType: 'article_external_view',
        articleId: article.id,
      });
      await WebBrowser.openBrowserAsync(article.original_url);
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  };

  const handleRelatedArticlePress = useCallback(
    (relatedArticle: NewsArticle) => {
      trackEvent({ eventType: 'article_view', articleId: relatedArticle.id });
      navigation.push('ArticleDetail', { articleId: relatedArticle.id });
    },
    [trackEvent, navigation]
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={relatedNews}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Enhanced Header with back, bookmark, and share buttons */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="bookmark-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons name="share-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Article Image */}
            {article.image_url && (
              <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
            )}

            {/* Article Content */}
            <View style={styles.content}>
              {/* Title */}
              <Text style={styles.title}>{article.title}</Text>

              {/* Source & Time */}
              <View style={styles.metaContainer}>
                {article.news_sources && (
                  <View style={styles.sourceRow}>
                    <Text style={styles.sourceName}>{article.news_sources.name}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.publishedTime}>{timeAgo(article.published_at)} ago</Text>
                  </View>
                )}
              </View>

              {/* Engagement Bar */}
              <View style={styles.engagementBar}>
                <TouchableOpacity style={styles.engagementAction} onPress={handleLikePress}>
                  <Ionicons
                    name={engagement?.isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={engagement?.isLiked ? COLORS.error : COLORS.textSecondary}
                  />
                  <Text style={styles.engagementText}>
                    {engagement?.likeCount ?? 0} {engagement?.likeCount === 1 ? 'Like' : 'Likes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.engagementAction}
                  onPress={() => setShowComments(!showComments)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color={COLORS.textSecondary} />
                  <Text style={styles.engagementText}>
                    {engagement?.commentCount ?? 0}{' '}
                    {engagement?.commentCount === 1 ? 'Comment' : 'Comments'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Summary */}
              {article.summary && <Text style={styles.summary}>{article.summary}</Text>}

              {/* Read Full Story Button */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={handleReadFullStory}
                  activeOpacity={0.8}
                >
                  <Text style={styles.readButtonText}>Read full story at source</Text>
                  <Ionicons
                    name="open-outline"
                    size={20}
                    color={COLORS.background}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Comments Section */}
              {showComments && (
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsSectionTitle}>Comments</Text>

                  {/* Comment Input */}
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      placeholderTextColor={COLORS.textLight}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.commentSubmitButton,
                        !commentText.trim() && styles.commentSubmitButtonDisabled,
                      ]}
                      onPress={handleCommentSubmit}
                      disabled={!commentText.trim()}
                    >
                      <Ionicons name="send" size={20} color={COLORS.background} />
                    </TouchableOpacity>
                  </View>

                  {/* Comments List */}
                  {comments && comments.length > 0 ? (
                    <View style={styles.commentsList}>
                      {comments.map((comment) => (
                        <View key={comment.id} style={styles.commentItem}>
                          <View style={styles.commentHeader}>
                            <Ionicons
                              name="person-circle-outline"
                              size={32}
                              color={COLORS.textSecondary}
                            />
                            <View style={styles.commentContent}>
                              <Text style={styles.commentAuthor}>Anonymous</Text>
                              <Text style={styles.commentTime}>
                                {timeAgo(comment.created_at)} ago
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.commentText}>{comment.content}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
                  )}
                </View>
              )}
            </View>

            {/* Related News Section Header */}
            <View style={styles.relatedNewsHeader}>
              <Text style={styles.relatedNewsTitle}>Read More News</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <RelatedNewsItem item={item} onPress={handleRelatedArticlePress} />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <LoadingSpinner size="small" />
            </View>
          ) : null
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, // Added top padding to prevent overlap
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  metaContainer: {
    marginBottom: SPACING.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dot: {
    marginHorizontal: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  publishedTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 36,
    marginBottom: SPACING.md,
  },
  engagementBar: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    gap: SPACING.xl,
  },
  engagementAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  engagementText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summary: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    lineHeight: 28,
    marginBottom: SPACING.xl,
  },
  actionContainer: {
    marginTop: SPACING.lg,
  },
  readButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  readButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
  commentsSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentsSectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
  },
  commentSubmitButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSubmitButtonDisabled: {
    opacity: 0.5,
  },
  commentsList: {
    gap: SPACING.md,
  },
  commentItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
    marginLeft: 40,
  },
  noComments: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.xl,
  },
  relatedNewsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  relatedNewsTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  backButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
});
