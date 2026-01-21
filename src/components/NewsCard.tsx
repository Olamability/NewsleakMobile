import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../types/news';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { formatRelativeTime } from '../utils/helpers';

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
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          {article.news_sources && (
            <Text style={styles.source} numberOfLines={1}>
              {article.news_sources.name}
            </Text>
          )}
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.time}>{formatRelativeTime(article.published_at)}</Text>
            {onBookmarkPress && (
              <TouchableOpacity
                onPress={onBookmarkPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isBookmarked ? COLORS.primary : COLORS.iconGray}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!imageError && article.image_url ? (
          <Image
            source={{ uri: article.image_url }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="newspaper-outline" size={32} color={COLORS.textLight} />
          </View>
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
  source: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
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
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
  },
  imagePlaceholder: {
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
