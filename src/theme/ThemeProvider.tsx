/**
 * Theme context — wraps the app and provides color tokens + type scale.
 * Driven entirely by the user's theme setting; no system theme auto-detection
 * needed (user has an explicit picker). SPEC §7, STRUCTURE §6.
 */

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { Theme, FontScale } from '../data/types';
import {
  type ColorTokens,
  type TypeScale,
  colorTokens,
  getTypeScale,
} from './tokens';

interface ThemeContextValue {
  theme: Theme;
  colors: ColorTokens;
  typeScale: TypeScale;
  fontScale: FontScale;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colors: colorTokens.light,
  typeScale: getTypeScale('medium'),
  fontScale: 'medium',
});

interface Props {
  theme: Theme;
  fontScale: FontScale;
  children: ReactNode;
}

export function ThemeProvider({ theme, fontScale, children }: Props) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: colorTokens[theme],
      typeScale: getTypeScale(fontScale),
      fontScale,
    }),
    [theme, fontScale],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
