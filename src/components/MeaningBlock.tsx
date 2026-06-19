/**
 * MeaningBlock — renders the bundled meaning_long text.
 * Always shows immediately (bundled, no spinner). SPEC §3.2.
 * Marks placeholder text with a visible warning for the dev scaffold.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import BodyText from './BodyText';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  text: string;
}

const PLACEHOLDER_PREFIX = '[PLACEHOLDER';

export default function MeaningBlock({ text }: Props) {
  const { colors } = useTheme();
  const isPlaceholder = text.trimStart().startsWith(PLACEHOLDER_PREFIX);

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      {isPlaceholder && (
        <View style={[styles.warning, { backgroundColor: colors.tagBackground, borderColor: colors.warning }]}>
          <BodyText size="caption" style={{ color: colors.warning }}>
            ⚠ Dev scaffold — content pending scholarly review (SPEC §9)
          </BodyText>
        </View>
      )}
      <BodyText size="body" style={[styles.text, { color: colors.text }]}>
        {text}
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  warning: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  text: {
    lineHeight: 26,
  },
});
