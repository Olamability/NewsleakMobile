import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

interface RecentSearchChipProps {
  query: string;
  onPress: (query: string) => void;
  onDelete: () => void;
}

export const RecentSearchChip: React.FC<RecentSearchChipProps> = ({ query, onPress, onDelete }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.textContainer}
        onPress={() => onPress(query)}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={16} color={COLORS.textLight} style={styles.icon} />
        <Text style={styles.text}>{query}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color={COLORS.textLight} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  deleteButton: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
});
