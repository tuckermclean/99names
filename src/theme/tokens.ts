/**
 * Design tokens: color palettes per theme, type scale.
 * All color pairs meet WCAG AA contrast (4.5:1 min for text). SPEC §7, §8.
 */

import type { Theme, FontScale } from '../data/types';

// ─── Color tokens ─────────────────────────────────────────────────────────────

export interface ColorTokens {
  /** Page / screen background */
  background: string;
  /** Primary text */
  text: string;
  /** Subdued / secondary text (still ≥ 4.5:1 on background) */
  textMuted: string;
  /** Arabic display text */
  arabicText: string;
  /** Separator / divider lines */
  border: string;
  /** Card / row surface */
  surface: string;
  /** Interactive / accent (used sparingly) */
  accent: string;
  /** Disabled / placeholder text */
  textDisabled: string;
  /** Status bar style: 'light-content' | 'dark-content' */
  statusBar: 'light-content' | 'dark-content';
  /** Header / nav background */
  headerBackground: string;
  /** Header title and icon tint */
  headerText: string;
  /** Provenance tag background */
  tagBackground: string;
  /** Provenance tag text */
  tagText: string;
  /** Placeholder / warning text color */
  warning: string;
}

const light: ColorTokens = {
  background: '#FAFAF8',
  text: '#1A1A1A',
  textMuted: '#555550',
  arabicText: '#1A1A1A',
  border: '#D8D4CC',
  surface: '#FFFFFF',
  accent: '#2A6D3A',        // deep green — dignified, calm
  textDisabled: '#999990',
  statusBar: 'dark-content',
  headerBackground: '#FAFAF8',
  headerText: '#1A1A1A',
  tagBackground: '#EEF5F0',
  tagText: '#2A6D3A',
  warning: '#8B6914',
};

const dark: ColorTokens = {
  background: '#0F0F0E',
  text: '#EDEDE8',
  textMuted: '#A8A8A0',
  arabicText: '#F0EDE4',
  border: '#2E2E28',
  surface: '#1A1A18',
  accent: '#5DB87A',
  textDisabled: '#5A5A54',
  statusBar: 'light-content',
  headerBackground: '#0F0F0E',
  headerText: '#EDEDE8',
  tagBackground: '#1A2E1E',
  tagText: '#5DB87A',
  warning: '#D4A843',
};

const sepia: ColorTokens = {
  background: '#F5F0E8',
  text: '#2C2318',
  textMuted: '#5A4E3A',
  arabicText: '#1E160A',
  border: '#CCC0A8',
  surface: '#FDFAF4',
  accent: '#6B4A1A',        // warm brown
  textDisabled: '#9A8C7A',
  statusBar: 'dark-content',
  headerBackground: '#F5F0E8',
  headerText: '#2C2318',
  tagBackground: '#EDE4D0',
  tagText: '#6B4A1A',
  warning: '#7A5A10',
};

export const colorTokens: Record<Theme, ColorTokens> = { light, dark, sepia };

// ─── Type scale ───────────────────────────────────────────────────────────────

export interface TypeScale {
  /** Arabic display (large focal text on Detail) */
  arabicDisplay: number;
  /** Arabic medium (row display) */
  arabicRow: number;
  /** Arabic small (provenance / inline) */
  arabicSmall: number;
  /** Transliteration under Arabic display */
  translitDisplay: number;
  /** Transliteration in list row */
  translitRow: number;
  /** Translation line */
  translation: number;
  /** Body / meaning_long text */
  body: number;
  /** Small / caption */
  caption: number;
  /** Section header */
  sectionHeader: number;
  /** UI label (buttons, settings) */
  label: number;
}

const scaleBase: TypeScale = {
  arabicDisplay: 52,
  arabicRow: 28,
  arabicSmall: 18,
  translitDisplay: 18,
  translitRow: 13,
  translation: 15,
  body: 16,
  caption: 13,
  sectionHeader: 13,
  label: 15,
};

const scaleMultiplier: Record<FontScale, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
  xlarge: 1.45,
};

export function getTypeScale(fontScale: FontScale): TypeScale {
  const m = scaleMultiplier[fontScale];
  return Object.fromEntries(
    Object.entries(scaleBase).map(([k, v]) => [k, Math.round((v as number) * m)]),
  ) as unknown as TypeScale;
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

// ─── Touch targets ────────────────────────────────────────────────────────────

/** Minimum touch target per SPEC §8 */
export const MIN_TOUCH_TARGET = 48;
