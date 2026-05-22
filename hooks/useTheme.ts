import { useStore } from '@/hooks/useStore';
import { darkTheme, lightTheme, Theme } from '@/constants/theme';

export function useTheme(): Theme {
  const dark = useStore((s) => s.settings.darkMode);
  return dark ? darkTheme : lightTheme;
}
