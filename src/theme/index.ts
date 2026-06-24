import { StyleSheet } from 'react-native';

export const colors = {
  background: '#080D1F',
  surface: '#111827',
  surfaceLight: '#1A2236',
  surfaceHighlight: '#222D45',

  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDim: '#4A3FA0',

  accent: '#FDCB6E',
  accentSoft: '#D4A84A',
  accentDim: '#7A6530',

  success: '#00B894',
  successLight: '#55EFC4',
  successDim: '#1B7A5E',

  textPrimary: '#F0EFFA',
  textSecondary: '#9093A8',
  textMuted: '#555972',

  border: '#1F2940',
  borderLight: '#2D3A55',
  focusRing: '#A29BFE',
  focusGlow: '#3D3762',

  danger: '#E17055',
  dangerDim: '#7A3E30',

  overlay: '#0D1225',
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
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
  xl: 64,
  xxl: 80,
  hero: 112,
};

export const borderRadiusValues = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 999,
};

export function rounded(size: keyof typeof borderRadiusValues) {
  const r = borderRadiusValues[size];
  return {
    borderTopLeftRadius: r,
    borderTopRightRadius: r,
    borderBottomLeftRadius: r,
    borderBottomRightRadius: r,
  };
}

export const commonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    ...rounded('xl'),
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
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
