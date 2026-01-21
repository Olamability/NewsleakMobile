import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SponsoredContent } from '../types/news';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../constants/theme';

interface SponsoredCardProps {
  content: SponsoredContent;
  onPress: (content: SponsoredContent) => void;
}

export const SponsoredCard: React.FC<SponsoredCardProps> = ({ content, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(content)} activeOpacity={0.7}>
      {content.image_url && (
        <Image source={{ uri: content.image_url }} style={styles.image} resizeMode="cover" />
      )}

      <View style={styles.badge}>
        <Text style={styles.badgeText}>SPONSORED</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={3}>
          {content.title}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {content.summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.sponsored,
    ...SHADOWS.md,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.backgroundSecondary,
  },
  badge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.sponsored,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  summary: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
