/**
 * Spacing tokens based on an 8pt / 4pt grid system.
 * Touch targets enforce a minimum of 44pt for accessibility.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const layout = {
  minTouchTarget: 44,
  screenPaddingHorizontal: 16,
  cardPadding: 16,
  cardGap: 12,
} as const;
