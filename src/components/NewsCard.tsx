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

export const NewsCard: React.FC<NewsCardProps> = React.memo(
  ({ article, onPress, onBookmarkPress, isBookmarked = false }) => {
    const { data: engagement } = useArticleEngagement(article.id);
    const { mutate: toggleLike } = useToggleLike();

    const handleLikePress = (e: GestureResponderEvent) => {
      e.stopPropagation();
      toggleLike({ articleId: article.id });
    };

    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.content}>
          {/* Source Logo Circle */}
          <View style={styles.sourceLogoContainer}>
            {article.news_sources?.logo_url ? (
              <Image 
                source={{ uri: article.news_sources.logo_url }} 
                style={styles.sourceLogo} 
                resizeMode="cover" 
              />
            ) : (
              <View style={[styles.sourceLogo, styles.sourceLogoPlaceholder]}>
                <Text style={styles.sourceLogoText}>
                  {(article.news_sources?.name || article.source_name || 'N')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.textContainer}>
            {/* Source Name and Time */}
            <View style={styles.sourceRow}>
              <Text style={styles.source} numberOfLines={1}>
                {article.news_sources?.name || article.source_name || 'Unknown Source'}
              </Text>
              <Text style={styles.time}>{formatRelativeTime(article.published_at)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {article.title}
            </Text>

            {/* Engagement Row */}
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
                  <Text style={styles.engagementCount}>
                    {engagement?.likeCount}
                  </Text>
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
                <Text style={styles.engagementCount}>Comment</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Image */}
          {article.image_url && article.image_url.trim() !== '' && (
            <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

NewsCard.displayName = 'NewsCard';

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
    gap: SPACING.md,
  },
  sourceLogoContainer: {
    marginTop: 2,
  },
  sourceLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundSecondary,
  },
  sourceLogoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  sourceLogoText: {
    color: COLORS.headerText,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  source: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
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
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
});
