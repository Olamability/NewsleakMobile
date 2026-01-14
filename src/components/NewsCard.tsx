import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { NewsArticle } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { getCategoryColor } from '../constants/categories';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const categoryColor = getCategoryColor(article.category);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: article.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          {onBookmarkPress && (
            <TouchableOpacity onPress={onBookmarkPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>

        <Text style={styles.summary} numberOfLines={3}>
          {article.summary}
        </Text>

        <View style={styles.footer}>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceName}>{article.source_name}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{formatDate(article.published_at)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  summary: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginHorizontal: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
});
