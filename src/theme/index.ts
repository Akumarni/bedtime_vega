import { StyleSheet } from 'react-native';

export const colors = {
  background: '#0B1026',
  surface: '#151B33',
  surfaceLight: '#1E2747',
  surfaceHighlight: '#253058',

  primary: '#7B6BA8',
  primaryLight: '#9B8EC4',
  primaryDim: '#5C4F87',

  accent: '#E8B86D',
  accentSoft: '#C49A4E',
  accentDim: '#8B7040',

  success: '#5CB87A',
  successLight: '#6ECB8A',
  successDim: '#3A7A50',

  textPrimary: '#E8E6F0',
  textSecondary: '#8B87A3',
  textMuted: '#5D5A70',

  border: '#2A3050',
  focusRing: '#9B8EC4',
  focusGlow: 'rgba(155, 142, 196, 0.3)',

  danger: '#D46B6B',
  dangerDim: '#8B4545',

  overlay: 'rgba(11, 16, 38, 0.85)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const fontSize = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  xxl: 48,
  hero: 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const commonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardFocused: {
    borderColor: colors.focusRing,
    shadowColor: colors.focusGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bodyText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  mutedText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const avatarEmojis = ['🌙', '⭐', '🦉', '🐻', '🦊', '🐰', '🌈', '🦋'];

export const defaultChecklistItems = [
  { title: 'Brush teeth', icon: '🪥' },
  { title: 'Put on pajamas', icon: '👕' },
  { title: 'Wash face', icon: '🧼' },
  { title: 'Pick out clothes for tomorrow', icon: '👖' },
  { title: 'Read a book', icon: '📖' },
  { title: 'Tidy up toys', icon: '🧸' },
  { title: 'Get water bottle', icon: '💧' },
];

export const defaultRewards = [
  { title: 'Extra story time', icon: '📚' },
  { title: '10 min later bedtime', icon: '🕐' },
  { title: 'Pick breakfast', icon: '🥞' },
  { title: 'Movie night pick', icon: '🎬' },
  { title: 'Special sticker', icon: '⭐' },
  { title: 'Park trip', icon: '🌳' },
  { title: 'Blanket fort', icon: '🏰' },
  { title: 'Favorite snack', icon: '🍪' },
];
