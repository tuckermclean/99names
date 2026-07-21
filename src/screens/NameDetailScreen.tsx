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
import * as player from '../audio/player';

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

  // Bookmark toggle — presentational only; state + persistence already live
  // in SettingsContext (settings.bookmarks / TOGGLE_BOOKMARK). SPEC §8: never
  // a color-only signal, so we pair a filled/outline glyph with an
  // accessibilityLabel + accessibilityState that both state bookmarked/not.
  const isBookmarked = settings.bookmarks.includes(nameId);
  const handleToggleBookmark = useCallback(() => {
    dispatch(actions.toggleBookmark(nameId));
  }, [dispatch, nameId]);

  // Update last-read whenever the name changes (including via param swap)
  React.useEffect(() => {
    if (nameId) dispatch(actions.setLastRead(nameId));
  }, [nameId, dispatch]);

  // Autoplay this name's recitation when the preference is on (SPEC §5).
  // Depends on `nameId` so Prev/Next param-swap re-triggers autoplay for the
  // newly-shown name; audio keeps playing across Detail <-> Reading and only
  // stops when the user returns to the List (NamesListScreen's focus effect).
  const autoplayEnabled = settings.audioPrefs.autoplay;
  React.useEffect(() => {
    if (nameId && autoplayEnabled) {
      player.play(nameId);
    }
  }, [nameId, autoplayEnabled]);

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

        {/* Bookmark toggle — kept separate from the audio row below so it
            doesn't crowd Play/Pause. Filled star = bookmarked, outline = not. */}
        <View style={styles.bookmarkRow}>
          <Pressable
            onPress={handleToggleBookmark}
            style={({ pressed }) => [
              styles.bookmarkBtn,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked
                ? `Remove ${name.transliteration_ascii} from bookmarks`
                : `Add ${name.transliteration_ascii} to bookmarks`
            }
            accessibilityState={{ selected: isBookmarked }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BodyText style={{ color: colors.accent, fontSize: 22, lineHeight: 26 }}>
              {isBookmarked ? '★' : '☆'}
            </BodyText>
          </Pressable>
        </View>

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
  bookmarkRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  bookmarkBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
