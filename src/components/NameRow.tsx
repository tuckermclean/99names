/**
 * NameRow — one row in the list. Same visual quality for both the active 99
 * and Further Names; the only difference is whether an index badge shows.
 * SPEC §3.1, AGENTS.md §Further Names.
 */

import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useSettings } from '../state/SettingsContext';
import ArabicText from './ArabicText';
import BodyText from './BodyText';
import AudioButton from './AudioButton';
import type { CorpusName } from '../data/types';

interface Props {
  name: CorpusName;
  /** 1-based index in the active enumeration, or undefined for Further Names */
  index?: number;
  onPress: (nameId: string) => void;
}

export default function NameRow({ name, index, onPress }: Props) {
  const { colors } = useTheme();
  const { settings } = useSettings();

  // Not using `spacing` from the theme token directly — keep it simple here
  const borderColor = colors.border;
  const backgroundColor = colors.surface;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor, borderBottomColor: borderColor },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onPress(name.id)}
      accessibilityRole="button"
      accessibilityLabel={`${name.transliteration_ascii}, ${name.translation}${index ? `, number ${index}` : ''}`}
    >
      {/* Index badge (active 99 only) */}
      <View style={styles.indexCell}>
        {index !== undefined ? (
          <BodyText size="caption" muted style={styles.indexText}>
            {index}
          </BodyText>
        ) : null}
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <ArabicText size="row" style={styles.arabic}>
          {name.arabic}
        </ArabicText>
        {settings.showTransliteration ? (
          <BodyText size="caption" muted style={styles.translit}>
            {name.transliteration}
          </BodyText>
        ) : null}
        <BodyText size="translation" style={styles.translation}>
          {name.translation}
        </BodyText>
      </View>

      {/* Quick-listen button */}
      <View style={styles.audioCell}>
        <AudioButton nameId={name.id} variant="compact" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 80,
  },
  indexCell: {
    width: 32,
    alignItems: 'flex-end',
    marginRight: 10,
  },
  indexText: {
    fontVariant: ['tabular-nums'],
  },
  content: {
    flex: 1,
    alignItems: 'flex-end', // Arabic text right-aligns naturally
  },
  arabic: {
    marginBottom: 2,
  },
  translit: {
    textAlign: 'left',
    alignSelf: 'stretch',
    marginTop: 2,
  },
  translation: {
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  audioCell: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
