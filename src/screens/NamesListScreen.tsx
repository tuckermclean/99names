/**
 * NamesListScreen — home screen. Two-section SectionList: the active 99 and
 * Further Names. Both sections render identical quality rows. SPEC §3.1.
 *
 * Audio rule: stop playback when this screen comes into focus. AGENTS.md §Audio.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SectionList,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSettings, actions } from '../state/SettingsContext';
import { useTheme } from '../theme/ThemeProvider';
import {
  getActiveList,
  getFurtherNames,
  getEnumerationById,
  getIndexInEnumeration,
  getTraversalOrder,
  getNameById,
} from '../data/access';
import * as player from '../audio/player';
import type { AudioPlayerState } from '../audio/player';

import NameRow from '../components/NameRow';
import SectionHeader from '../components/SectionHeader';
import BodyText from '../components/BodyText';
import type { CorpusName } from '../data/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NamesList'>;

interface Section {
  title: string;
  subtitle?: string;
  isFurtherNames: boolean;
  data: CorpusName[];
  onHeaderPress?: () => void;
}

export default function NamesListScreen({ navigation }: Props) {
  const { settings, dispatch } = useSettings();
  const { colors } = useTheme();
  const { activeEnumeration, lastReadNameId, audioPrefs, bookmarks } = settings;

  const [sequencePlaying, setSequencePlaying] = useState(false);

  // Stop audio when returning to the list (AGENTS.md audio rule)
  useFocusEffect(
    useCallback(() => {
      player.stop();
      setSequencePlaying(false);
    }, []),
  );

  // Track player state so the "Play all" control reflects whether the
  // corpus sequence is actively playing (SPEC §8: never color-only signal).
  useEffect(() => {
    return player.subscribe((state: AudioPlayerState) => {
      if (state.status === 'idle') setSequencePlaying(false);
    });
  }, []);

  const activeList = useMemo(
    () => getActiveList(activeEnumeration),
    [activeEnumeration],
  );
  const furtherNames = useMemo(
    () => getFurtherNames(activeEnumeration),
    [activeEnumeration],
  );
  const activeEnum = getEnumerationById(activeEnumeration);

  // Bookmarked names, resolved for display — presentational only, no new
  // persistence; settings.bookmarks / TOGGLE_BOOKMARK already live in
  // SettingsContext. Kept minimal: a plain vertical list of NameRows above
  // the SectionList, shown only when there's something to show.
  const bookmarkedNames: CorpusName[] = useMemo(
    () =>
      bookmarks
        .map((id) => getNameById(id))
        .filter((n): n is CorpusName => Boolean(n)),
    [bookmarks],
  );

  // Full traversal order (active 99 then Further Names) for "play all".
  const traversalIds = useMemo(
    () => getTraversalOrder(activeEnumeration).map((n) => n.id),
    [activeEnumeration],
  );

  const handlePlayAll = useCallback(() => {
    if (sequencePlaying) {
      player.stop();
      setSequencePlaying(false);
    } else {
      setSequencePlaying(true);
      player.playSequence(traversalIds);
    }
  }, [sequencePlaying, traversalIds]);

  const sections: Section[] = useMemo(
    () => [
      {
        title: activeEnum?.title ?? 'The 99 Names',
        subtitle: 'Tap to change enumeration',
        isFurtherNames: false,
        data: activeList,
        onHeaderPress: () => navigation.navigate('Settings'),
      },
      {
        title: 'Further Names',
        subtitle:
          'Other names of Allah affirmed in the Quran and Sunnah, beyond this enumeration of ninety-nine',
        isFurtherNames: true,
        data: furtherNames,
      },
    ],
    [activeEnum, activeList, furtherNames, navigation],
  );

  const handleRowPress = useCallback(
    (nameId: string) => {
      dispatch(actions.setLastRead(nameId));
      navigation.navigate('NameDetail', { nameId });
    },
    [dispatch, navigation],
  );

  const renderItem = useCallback(
    ({ item, section }: { item: CorpusName; section: Section }) => {
      const index = section.isFurtherNames
        ? undefined
        : getIndexInEnumeration(item.id, activeEnumeration) ?? undefined;
      return <NameRow name={item} index={index} onPress={handleRowPress} />;
    },
    [activeEnumeration, handleRowPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <SectionHeader
        title={section.title}
        subtitle={section.subtitle}
        onPress={section.onHeaderPress}
      />
    ),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* "Resume" affordance */}
      {lastReadNameId ? (
        <Pressable
          style={({ pressed }) => [
            styles.resumeBar,
            { backgroundColor: colors.tagBackground, borderBottomColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            if (lastReadNameId) navigation.navigate('NameDetail', { nameId: lastReadNameId });
          }}
          accessibilityRole="button"
          accessibilityLabel="Resume where you left off"
        >
          <BodyText size="caption" style={{ color: colors.accent }}>
            ↩ Resume last name
          </BodyText>
        </Pressable>
      ) : null}

      {/* "Play all" — only surfaced when the audio preference enables it
          (Settings → audio prefs → play-all sequence). Uses playSequence()
          over the full traversal order; auto-advance is handled by the
          player itself. Stops (like all audio) when the List regains focus. */}
      {audioPrefs.playAllSequence ? (
        <Pressable
          style={({ pressed }) => [
            styles.playAllBar,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handlePlayAll}
          accessibilityRole="button"
          accessibilityLabel={
            sequencePlaying
              ? 'Stop playing all names'
              : 'Play all names in sequence'
          }
          accessibilityState={{ selected: sequencePlaying }}
        >
          <BodyText size="caption" style={{ color: colors.accent }}>
            {sequencePlaying ? '⏸ Stop playing all' : '▶ Play all names'}
          </BodyText>
        </Pressable>
      ) : null}

      {/* Bookmarks — minimal surfaced list, only shown when ≥1 bookmark
          exists. Reuses NameRow + the same row-press navigation as below. */}
      {bookmarkedNames.length > 0 ? (
        <View style={[styles.bookmarksSection, { borderBottomColor: colors.border }]}>
          <SectionHeader
            title="Bookmarks"
            subtitle={`${bookmarkedNames.length} saved name${bookmarkedNames.length === 1 ? '' : 's'}`}
          />
          {bookmarkedNames.map((n) => (
            <NameRow
              key={n.id}
              name={n}
              index={getIndexInEnumeration(n.id, activeEnumeration) ?? undefined}
              onPress={handleRowPress}
            />
          ))}
        </View>
      ) : null}

      <SectionList<CorpusName, Section>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  resumeBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  playAllBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  bookmarksSection: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listContent: {
    paddingBottom: 40,
  },
});
