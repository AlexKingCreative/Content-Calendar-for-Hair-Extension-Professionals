export const colors = {
  primary: '#D4A574',
  primaryLight: '#E8C9A8',
  primaryDark: '#B8956A',
  
  background: '#FFF8F0',
  backgroundGradientStart: '#FFF8F0',
  backgroundGradientEnd: '#F5E6D3',
  
  surface: '#FFFFFF',
  surfaceSecondary: '#FAF5F0',
  
  text: '#5D4E3C',
  textSecondary: '#8B7355',
  textTertiary: '#A89683',
  textOnPrimary: '#FFFFFF',
  
  border: 'rgba(93, 78, 60, 0.1)',
  borderLight: 'rgba(212, 165, 116, 0.2)',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  glass: {
    background: 'rgba(255, 255, 255, 0.7)',
    backgroundLight: 'rgba(255, 255, 255, 0.85)',
    backgroundDark: 'rgba(255, 248, 240, 0.9)',
    border: 'rgba(255, 255, 255, 0.5)',
    borderAccent: 'rgba(212, 165, 116, 0.3)',
    shadow: 'rgba(93, 78, 60, 0.08)',
    shadowDark: 'rgba(93, 78, 60, 0.15)',
  },
  
  tab: {
    active: '#D4A574',
    inactive: '#A89683',
    background: 'rgba(255, 255, 255, 0.85)',
  },
};

export const gradients = {
  background: ['#FFF8F0', '#F5E6D3', '#EDD9C4'],
  card: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 248, 240, 0.8)'],
  primary: ['#D4A574', '#C49664'],
  glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'],
};

export const blur = {
  light: 10,
  medium: 20,
  heavy: 40,
  tab: 25,
  card: 15,
  header: 20,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
  card: 20,
  button: 12,
};

export const typography = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.glass.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
};

export const glassCard = {
  backgroundColor: colors.glass.background,
  borderRadius: borderRadius.card,
  borderWidth: 1,
  borderColor: colors.glass.border,
  ...shadows.glass,
};

export const glassButton = {
  backgroundColor: colors.glass.backgroundLight,
  borderRadius: borderRadius.button,
  borderWidth: 1,
  borderColor: colors.glass.border,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
};

export const primaryButton = {
  backgroundColor: colors.primary,
  borderRadius: borderRadius.button,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  ...shadows.sm,
};

export default {
  colors,
  gradients,
  blur,
  spacing,
  borderRadius,
  typography,
  shadows,
  animation,
  glassCard,
  glassButton,
  primaryButton,
};
