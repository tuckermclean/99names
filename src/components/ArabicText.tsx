/**
 * ArabicText — typed text wrapper for Arabic content.
 * Applies the bundled Amiri font, RTL writing direction, and the current
 * type scale. Language tag 'ar' ensures screen-readers pronounce correctly.
 * SPEC §7, §8, AGENTS.md §RTL.
 */

import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { arabicTextStyle } from '../theme/typography';

interface Props extends TextProps {
  size: 'display' | 'row' | 'small';
  bold?: boolean;
  color?: string;
}

export default function ArabicText({
  size,
  bold = false,
  color,
  style,
  ...rest
}: Props) {
  const { colors, typeScale } = useTheme();

  const fontSize =
    size === 'display'
      ? typeScale.arabicDisplay
      : size === 'row'
        ? typeScale.arabicRow
        : typeScale.arabicSmall;

  const base = bold
    ? { fontFamily: 'Amiri-Bold', fontSize, writingDirection: 'rtl' as const, textAlign: 'right' as const, lineHeight: fontSize * 1.65 }
    : arabicTextStyle(fontSize);

  return (
    <Text
      accessibilityLanguage="ar"
      style={[base, { color: color ?? colors.arabicText }, style]}
      {...rest}
    />
  );
}
