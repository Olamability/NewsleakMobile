// Theme constants for consistent UI across the app

export const COLORS = {
  primary: '#2563eb', // Blue
  primaryDark: '#1e40af',
  primaryLight: '#3b82f6',
  secondary: '#10b981', // Green
  accent: '#f59e0b', // Amber
  
  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  
  // Background colors
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundDark: '#111827',
  
  // UI colors
  border: '#e5e7eb',
  borderDark: '#d1d5db',
  card: '#ffffff',
  shadow: '#000000',
  
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Social/Category colors
  politics: '#dc2626',
  sports: '#059669',
  business: '#7c3aed',
  technology: '#0284c7',
  entertainment: '#db2777',
  health: '#16a34a',
  lifestyle: '#ea580c',
  breaking: '#ef4444',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semiBold: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const LAYOUT = {
  screenPadding: SPACING.md,
  cardSpacing: SPACING.md,
  iconSize: 24,
  avatarSize: 40,
};
