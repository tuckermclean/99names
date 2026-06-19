/**
 * NameDetailScreen — the heart of the app. One name, generous whitespace, calm.
 * Prev/Next uses setParams (param swap) — never pushes. SPEC §3.2, §4.
 */

import React, { useCallback } from 'react';
import {
  ScrollView,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSettings, actions } from '../state/SettingsContext';
import { useTheme } from '../theme/ThemeProvider';
import {
  getNameById,
  getIndexInEnumeration,
  getPrevName,
  getNextName,
} from '../data/access';

import NameHeader from '../components/NameHeader';
import AudioButton from '../components/AudioButton';
import ProvenanceLine from '../components/ProvenanceLine';
import MeaningBlock from '../components/MeaningBlock';
import QuranRefList from '../components/QuranRefList';
import PrevNextBar from '../components/PrevNextBar';
import BodyText from '../components/BodyText';

type Props = NativeStackScreenProps<RootStackParamList, 'NameDetail'>;

export default function NameDetailScreen({ route, navigation }: Props) {
  const { nameId } = route.params;
  const { settings, dispatch } = useSettings();
  const { colors } = useTheme();
  const { activeEnumeration } = settings;

  const name = getNameById(nameId);

  // Update last-read whenever the name changes (including via param swap)
  React.useEffect(() => {
    if (nameId) dispatch(actions.setLastRead(nameId));
  }, [nameId, dispatch]);

  const index = name
    ? getIndexInEnumeration(name.id, activeEnumeration) ?? undefined
    : undefined;

  const prev = name ? getPrevName(name.id, activeEnumeration) : null;
  const next = name ? getNextName(name.id, activeEnumeration) : null;

  // Param swap: does NOT push a new screen onto the back stack
  const goToName = useCallback(
    (id: string) => navigation.setParams({ nameId: id }),
    [navigation],
  );

  if (!name) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BodyText>Name not found.</BodyText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* The focal Arabic block */}
        <NameHeader name={name} index={index} />

        {/* Play / pause */}
        <View style={styles.audioRow}>
          <AudioButton nameId={name.id} variant="full" />
        </View>

        {/* Provenance — always in full, never truncated */}
        <ProvenanceLine name={name} />

        {/* Extended meaning */}
        <MeaningBlock text={name.meaning_long} />

        {/* Quran references */}
        <QuranRefList refs={name.quran_refs} />

        {/* "More" → Reading view */}
        <Pressable
          style={({ pressed }) => [
            styles.moreBtn,
            { borderTopColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => navigation.navigate('Reading', { nameId: name.id })}
          accessibilityRole="button"
          accessibilityLabel="More — open extended reading view"
        >
          <BodyText size="label" style={{ color: colors.accent }}>
            More — extended reading & external sources
          </BodyText>
          <BodyText style={{ color: colors.accent, fontSize: 18 }}>›</BodyText>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Prev / Next — sticky at bottom */}
      <PrevNextBar prev={prev} next={next} onGoTo={goToName} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  audioRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
});
