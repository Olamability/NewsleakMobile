import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../types/news';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

interface CategoryPillProps {
  category: Category;
  isActive?: boolean;
  onPress: (category: Category) => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({ category, isActive = false, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.active]}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.text, isActive && styles.activeText]}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  active: {
    backgroundColor: COLORS.primary,
  },
  icon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeText: {
    color: COLORS.background,
  },
});
