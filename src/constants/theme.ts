// Theme constants for consistent UI across the app - Based on UI Reference Designs

export const COLORS = {
  primary: '#E81E24', // Opera News Red
  primaryDark: '#C41519',
  primaryLight: '#FF3B41',
  secondary: '#1A1A1A', // Dark Gray
  accent: '#FFD700', // Gold for highlights

  // Button colors (from UI reference)
  buttonGray: '#7A8A99', // Gray button from Sign-In screen
  buttonGrayDark: '#5F6F7D',

  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textPlaceholder: '#B0B0B0',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundDark: '#1A1A1A',
  searchBackground: '#F0F4F8', // Light blue-gray for search inputs
  filterActive: '#D4E9FC', // Light blue for active filter chips

  // UI colors
  border: '#E0E0E0',
  borderDark: '#CCCCCC',
  borderLight: '#F0F0F0',
  card: '#FFFFFF',
  shadow: '#000000',

  // Status colors
  success: '#4CAF50',
  error: '#E81E24',
  warning: '#FFA726',
  info: '#2196F3',

  // Social/Category colors
  politics: '#E81E24',
  sports: '#4CAF50',
  business: '#2196F3',
  technology: '#44B8FF',
  entertainment: '#FF5722',
  health: '#00BCD4',
  lifestyle: '#FF9800',
  breaking: '#E81E24',
  environment: '#44B8FF',

  // Icon colors
  iconGray: '#8F9BB3',
  iconActive: '#222B45',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semiBold: 'System',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 19,
  xxl: 22,
  xxxl: 28,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  round: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const LAYOUT = {
  screenPadding: SPACING.md,
  cardSpacing: SPACING.md,
  iconSize: 24,
  avatarSize: 40,
};
