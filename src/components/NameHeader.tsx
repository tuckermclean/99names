/**
 * NameHeader — the large Arabic focal block at the top of NameDetail.
 * Arabic centered, very large; transliteration and translation beneath.
 * SPEC §3.2.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import ArabicText from './ArabicText';
import BodyText from './BodyText';
import { useSettings } from '../state/SettingsContext';
import { useTheme } from '../theme/ThemeProvider';
import type { CorpusName } from '../data/types';

interface Props {
  name: CorpusName;
  /** 1-based index in active enumeration, or undefined for Further Names */
  index?: number;
}

export default function NameHeader({ name, index }: Props) {
  const { settings } = useSettings();
  const { colors, typeScale } = useTheme();

  return (
    <View style={styles.container}>
      {/* Optional position number */}
      {index !== undefined ? (
        <BodyText size="caption" muted style={styles.indexLabel}>
          {index} of 99
        </BodyText>
      ) : null}

      {/* The focal element: Arabic name, very large */}
      <ArabicText size="display" style={styles.arabic}>
        {name.arabic}
      </ArabicText>

      {settings.showTransliteration ? (
        <BodyText
          size="label"
          muted
          style={[styles.translit, { color: colors.textMuted }]}
        >
          {name.transliteration}
        </BodyText>
      ) : null}

      <BodyText
        size="translation"
        style={[styles.translation, { color: colors.text }]}
      >
        {name.translation}
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  indexLabel: {
    marginBottom: 8,
  },
  arabic: {
    textAlign: 'center',
    marginBottom: 12,
  },
  translit: {
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  translation: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
});
