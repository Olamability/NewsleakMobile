// Theme constants for consistent UI across the app - Based on UI Reference Designs

export const COLORS = {
  primary: '#1E40AF', // Spazr Blue
  primaryDark: '#1E3A8A',
  primaryLight: '#3B82F6',
  secondary: '#F59E0B',
  accent: '#8B5CF6',

  // Button colors
  buttonGray: '#6B7280',
  buttonGrayDark: '#4B5563',

  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textPlaceholder: '#D1D5DB',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  backgroundDark: '#111827',
  searchBackground: '#F3F4F6',
  filterActive: '#DBEAFE',

  // UI colors
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  borderLight: '#F3F4F6',
  card: '#FFFFFF',
  shadow: '#000000',

  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Category colors
  politics: '#DC2626',
  sports: '#16A34A',
  business: '#EA580C',
  technology: '#0891B2',
  entertainment: '#9333EA',
  health: '#059669',
  lifestyle: '#EC4899',
  breaking: '#DC2626',
  environment: '#0891B2',
  
  // Sponsored color
  sponsored: '#8B5CF6',

  // Icon colors
  iconGray: '#9CA3AF',
  iconActive: '#1E40AF',
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
