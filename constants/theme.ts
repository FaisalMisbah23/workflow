// Design System Constants

export const Colors = {
  // Primary colors
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Secondary colors
  secondary: '#6B7280',
  secondaryDark: '#4B5563',
  secondaryLight: '#9CA3AF',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  
  // Background colors
  background: '#FFFFFF',
  backgroundVariant: '#F9FAFB',
  
  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  
  // Accent colors
  accent: '#10B981',
  accentDark: '#059669',
  
  // Error colors
  error: '#EF4444',
  errorDark: '#DC2626',
  errorLight: '#F87171',
  
  // Warning colors
  warning: '#F59E0B',
  warningDark: '#D97706',
  
  // Success colors
  success: '#10B981',
  successDark: '#059669',
  
  // Info colors
  info: '#3B82F6',
  infoDark: '#2563EB',
  
  // Semantic colors
  taskAssigned: '#3B82F6',
  deadlineReminder: '#EF4444',
  teamInvite: '#10B981',
  comment: '#F59E0B',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Font weights
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  
  // Line heights
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const IconSizes = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const Shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

export const ZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
