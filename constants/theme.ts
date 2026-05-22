export type ThemeMode = 'dark' | 'light';

export const palette = {
  accent: '#7DD3FC',
  accent2: '#38BDF8',
  success: '#34D399',
  warning: '#F59E0B',
  danger: '#F43F5E',
};

export interface Theme {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accent2: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
}

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#1A1D24',
  surface: '#22262F',
  surfaceAlt: '#2A2F3A',
  card: '#22262F',
  border: 'rgba(243,244,246,0.08)',
  text: '#F3F4F6',
  textMuted: '#A1A8B5',
  textDim: '#6B7280',
  accent: palette.accent,
  accent2: palette.accent2,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  shadow: '#000000',
};

export const lightTheme: Theme = {
  mode: 'light',
  background: '#F6F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F5',
  card: '#FFFFFF',
  border: 'rgba(0,0,0,0.06)',
  text: '#0B0B10',
  textMuted: '#5F5F6E',
  textDim: '#9A9AA8',
  accent: palette.accent,
  accent2: palette.accent2,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  shadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  bodySm: { fontSize: 13, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  }),
};
