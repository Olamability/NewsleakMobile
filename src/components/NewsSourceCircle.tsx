import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, SHADOWS } from '../constants/theme';

interface NewsSourceCircleProps {
  name: string;
  logoUrl?: string;
  onPress: () => void;
  isActive?: boolean;
}

export const NewsSourceCircle: React.FC<NewsSourceCircleProps> = ({
  name,
  logoUrl,
  onPress,
  isActive = false,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.circle, isActive && styles.circleActive]}>
        {logoUrl && <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="cover" />}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  circleActive: {
    borderColor: COLORS.primary,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
    maxWidth: 70,
  },
});
