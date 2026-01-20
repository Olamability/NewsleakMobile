import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingTopic } from '../types/news';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

interface TrendingTopicChipProps {
  topic: string;
  count?: number;
  onPress: (topic: string) => void;
}

export const TrendingTopicChip: React.FC<TrendingTopicChipProps> = ({ topic, count, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(topic)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.text}>{topic}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.filterActive,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
