/**
 * ReadingScreen — long-form reading + external tafsir links.
 * External links are the ONLY network surface in the app. SPEC §3.3, §6.
 * Audio continues from NameDetail (no stop on entry here). AGENTS.md §Audio.
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeProvider';
import { getNameById } from '../data/access';
import { useSettings } from '../state/SettingsContext';

import NameHeader from '../components/NameHeader';
import MeaningBlock from '../components/MeaningBlock';
import TafsirLinkList from '../components/TafsirLinkList';
import BodyText from '../components/BodyText';
import { getIndexInEnumeration } from '../data/access';

type Props = NativeStackScreenProps<RootStackParamList, 'Reading'>;

export default function ReadingScreen({ route }: Props) {
  const { nameId } = route.params;
  const { colors } = useTheme();
  const { settings } = useSettings();
  const name = getNameById(nameId);

  if (!name) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BodyText>Name not found.</BodyText>
      </View>
    );
  }

  const index = getIndexInEnumeration(name.id, settings.activeEnumeration) ?? undefined;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Brief name header for context */}
      <NameHeader name={name} index={index} />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Long-form meaning, rendered as markdown for comfortable reading.
          variant="reading": the divider above already separates this from
          the header, so MeaningBlock skips its own top border here. */}
      <MeaningBlock text={name.meaning_long} variant="reading" />

      {/* External links — clearly marked, gracefully offline */}
      <TafsirLinkList links={name.tafsir_links} />

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginVertical: 8,
  },
});
