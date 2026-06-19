/**
 * QuranRefList — displays Quranic verse references with their bundled text.
 * Bundled = always available offline, no spinner. SPEC §3.2.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import BodyText from './BodyText';
import ArabicText from './ArabicText';
import { useTheme } from '../theme/ThemeProvider';
import type { QuranRef } from '../data/types';

interface Props {
  refs: QuranRef[];
}

export default function QuranRefList({ refs }: Props) {
  const { colors } = useTheme();

  if (refs.length === 0) return null;

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <BodyText
        size="caption"
        style={[styles.heading, { color: colors.textMuted }]}
      >
        QURAN REFERENCES
      </BodyText>

      {refs.map((ref, i) => (
        <View
          key={`${ref.sura}:${ref.ayah}-${i}`}
          style={[styles.refBlock, { borderLeftColor: colors.accent }]}
        >
          <BodyText
            size="caption"
            style={[styles.refLabel, { color: colors.accent }]}
          >
            {ref.sura}:{ref.ayah}
          </BodyText>

          {ref.text_ar !== '[PLACEHOLDER]' ? (
            <ArabicText size="small" style={styles.arabicVerse}>
              {ref.text_ar}
            </ArabicText>
          ) : null}

          <BodyText size="caption" muted style={styles.translation}>
            {ref.text_en}
          </BodyText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  heading: {
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  refBlock: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    gap: 4,
  },
  refLabel: {
    fontWeight: '600',
  },
  arabicVerse: {
    marginTop: 4,
  },
  translation: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
