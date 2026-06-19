/**
 * BodyText — typed text wrapper for Latin UI text.
 * Applies the current type scale and theme colors.
 * Language tag 'en' ensures correct screen-reader pronunciation.
 * SPEC §7, §8.
 */

import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { bodyTextStyle } from '../theme/typography';

interface Props extends TextProps {
  size?: 'body' | 'label' | 'caption' | 'translation' | 'sectionHeader';
  muted?: boolean;
  color?: string;
}

export default function BodyText({
  size = 'body',
  muted = false,
  color,
  style,
  ...rest
}: Props) {
  const { colors, typeScale } = useTheme();

  const fontSize =
    size === 'label'
      ? typeScale.label
      : size === 'caption'
        ? typeScale.caption
        : size === 'translation'
          ? typeScale.translation
          : size === 'sectionHeader'
            ? typeScale.sectionHeader
            : typeScale.body;

  const resolvedColor = color ?? (muted ? colors.textMuted : colors.text);

  return (
    <Text
      accessibilityLanguage="en"
      style={[bodyTextStyle(fontSize), { color: resolvedColor }, style]}
      {...rest}
    />
  );
}
