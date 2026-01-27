import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../types/news';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { formatRelativeTime } from '../utils/helpers';
import { useArticleEngagement, useToggleLike } from '../lib/queries';

interface NewsCardProps {
  article: NewsArticle;
  onPress: () => void;
  onBookmarkPress?: () => void;
  isBookmarked?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onPress,
  onBookmarkPress,
  isBookmarked = false,
}) => {
  const { data: engagement } = useArticleEngagement(article.id);
  const { mutate: toggleLike } = useToggleLike();

  const handleLikePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    toggleLike({ articleId: article.id });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          {/* Source Name - now more prominent */}
          {article.news_sources && (
            <View style={styles.sourceContainer}>
              <Text style={styles.source} numberOfLines={1}>
                {article.news_sources.name}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>

          {/* Footer with time and engagement */}
          <View style={styles.footer}>
            <Text style={styles.time}>{formatRelativeTime(article.published_at)}</Text>

            {/* Engagement buttons */}
            <View style={styles.engagementContainer}>
              {/* Like button */}
              <TouchableOpacity
                onPress={handleLikePress}
                style={styles.engagementButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={engagement?.isLiked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={engagement?.isLiked ? COLORS.error : COLORS.iconGray}
                />
                {(engagement?.likeCount ?? 0) > 0 && (
                  <Text style={styles.engagementCount}>{engagement?.likeCount}</Text>
                )}
              </TouchableOpacity>

              {/* Comment button */}
              <TouchableOpacity
                style={styles.engagementButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={(e) => {
                  e.stopPropagation();
                  onPress(); // Navigate to detail to see comments
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color={COLORS.iconGray} />
                {(engagement?.commentCount ?? 0) > 0 && (
                  <Text style={styles.engagementCount}>{engagement?.commentCount}</Text>
                )}
              </TouchableOpacity>

              {/* Bookmark button */}
              {onBookmarkPress && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onBookmarkPress();
                  }}
                  style={styles.engagementButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={16}
                    color={isBookmarked ? COLORS.primary : COLORS.iconGray}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Image */}
        {article.image_url && (
          <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  sourceContainer: {
    marginBottom: SPACING.xs,
  },
  source: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
});
