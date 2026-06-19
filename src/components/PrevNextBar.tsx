/**
 * PrevNextBar — previous / next controls on NameDetail.
 * Uses setParams (param swap) — NEVER pushes a new screen.
 * Back from any name returns to the list, not to a chain. SPEC §4, AGENTS.md.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import BodyText from './BodyText';
import { useTheme } from '../theme/ThemeProvider';
import type { CorpusName } from '../data/types';

interface Props {
  prev: CorpusName | null;
  next: CorpusName | null;
  /** Call navigation.setParams({ nameId }) — do NOT push */
  onGoTo: (nameId: string) => void;
}

export default function PrevNextBar({ prev, next, onGoTo }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderTopColor: colors.border, backgroundColor: colors.background },
      ]}
    >
      {/* Prev */}
      <Pressable
        onPress={prev ? () => onGoTo(prev.id) : undefined}
        disabled={!prev}
        style={[styles.btn, !prev && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel={prev ? `Previous: ${prev.transliteration_ascii}` : 'No previous name'}
        accessibilityState={{ disabled: !prev }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <BodyText style={[styles.arrow, { color: prev ? colors.accent : colors.textDisabled }]}>
          ‹
        </BodyText>
        <View style={styles.label}>
          {prev ? (
            <>
              <BodyText size="caption" muted>Previous</BodyText>
              <BodyText size="caption" style={{ color: colors.accent }} numberOfLines={1}>
                {prev.transliteration}
              </BodyText>
            </>
          ) : (
            <BodyText size="caption" muted>—</BodyText>
          )}
        </View>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Next */}
      <Pressable
        onPress={next ? () => onGoTo(next.id) : undefined}
        disabled={!next}
        style={[styles.btn, styles.btnRight, !next && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel={next ? `Next: ${next.transliteration_ascii}` : 'No next name'}
        accessibilityState={{ disabled: !next }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={[styles.label, styles.labelRight]}>
          {next ? (
            <>
              <BodyText size="caption" muted>Next</BodyText>
              <BodyText size="caption" style={{ color: colors.accent }} numberOfLines={1}>
                {next.transliteration}
              </BodyText>
            </>
          ) : (
            <BodyText size="caption" muted>—</BodyText>
          )}
        </View>
        <BodyText style={[styles.arrow, { color: next ? colors.accent : colors.textDisabled }]}>
          ›
        </BodyText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  btnRight: {
    justifyContent: 'flex-end',
  },
  disabled: {
    opacity: 0.4,
  },
  arrow: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  label: {
    marginLeft: 8,
  },
  labelRight: {
    alignItems: 'flex-end',
    marginLeft: 0,
    marginRight: 8,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 8,
  },
});
