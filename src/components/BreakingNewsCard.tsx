import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { NewsArticle } from '../types/news';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../constants/theme';
import { timeAgo } from '../lib/helpers';

interface BreakingNewsCardProps {
  article: NewsArticle;
  onPress: (article: NewsArticle) => void;
}

export const BreakingNewsCard: React.FC<BreakingNewsCardProps> = ({ article, onPress }) => {
  const source = article.news_sources;
  const publishedTime = timeAgo(article.published_at);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(article)} activeOpacity={0.7}>
      {article.image_url && (
        <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
      )}

      <View style={styles.badge}>
        <Text style={styles.badgeText}>🔥 BREAKING</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.source}>{source?.name || article.source_name || 'Unknown Source'}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.time}>{publishedTime} ago</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    width: 280,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.backgroundSecondary,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.breaking,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  source: {
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
