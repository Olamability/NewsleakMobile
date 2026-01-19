import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { NewsArticle } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { getCategoryColor } from '../constants/categories';

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
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - SPACING.lg * 2;
  const imageWidth = Math.min(120, windowWidth * 0.3);
  const imageHeight = imageWidth * 0.75;

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
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContent}>
          <View style={styles.headerRow}>
            <Text style={styles.sourceName} numberOfLines={1}>{article.source_name}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.time}>{formatDate(article.published_at)}</Text>
          </View>

          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
              <Text style={styles.actionIcon}>👍</Text>
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
              <Text style={styles.actionIcon}>👎</Text>
              <Text style={styles.actionText}>Dislike</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {article.image_url ? (
          <Image
            source={{ uri: article.image_url }}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { width: imageWidth, height: imageHeight }]}>
            <Text style={styles.placeholderText}>📰</Text>
          </View>
        )}

        {onBookmarkPress && (
          <TouchableOpacity 
            onPress={onBookmarkPress} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.bookmarkButton}
          >
            <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  image: {
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    marginLeft: SPACING.md,
  },
  imagePlaceholder: {
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.5,
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 20,
    flex: 1,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  sourceName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  bookmarkButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.xs,
    ...SHADOWS.sm,
  },
  bookmarkIcon: {
    fontSize: 16,
  },
});
