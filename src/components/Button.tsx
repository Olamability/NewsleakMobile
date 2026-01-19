import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gray' | 'social';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loadingColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  icon,
  disabled,
  style,
  loadingColor,
  ...props
}) => {
  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth ? styles.fullWidth : {},
    disabled ? styles.disabled : {},
    style as ViewStyle,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled ? styles.disabledText : {},
  ];

  const getLoadingColor = () => {
    if (loadingColor) return loadingColor;
    if (variant === 'outline' || variant === 'text') return COLORS.primary;
    if (variant === 'gray') return COLORS.background;
    return COLORS.background;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getLoadingColor()} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  grayButton: {
    backgroundColor: COLORS.buttonGray,
  },
  socialButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  // Sizes
  smallButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  mediumButton: {
    paddingVertical: SPACING.md,
  },
  largeButton: {
    paddingVertical: SPACING.lg,
  },

  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.background,
  },
  secondaryText: {
    color: COLORS.background,
  },
  outlineText: {
    color: COLORS.primary,
  },
  textText: {
    color: COLORS.primary,
  },
  grayText: {
    color: COLORS.background,
  },
  socialText: {
    color: COLORS.text,
  },
  disabledText: {
    opacity: 0.5,
  },

  // Text sizes
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
});
