/**
 * NamesListScreen — home screen. Two-section SectionList: the active 99 and
 * Further Names. Both sections render identical quality rows. SPEC §3.1.
 *
 * Audio rule: stop playback when this screen comes into focus. AGENTS.md §Audio.
 */

import React, { useCallback, useMemo } from 'react';
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
} from '../data/access';
import * as player from '../audio/player';

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
  const { activeEnumeration, lastReadNameId } = settings;

  // Stop audio when returning to the list (AGENTS.md audio rule)
  useFocusEffect(
    useCallback(() => {
      player.stop();
    }, []),
  );

  const activeList = useMemo(
    () => getActiveList(activeEnumeration),
    [activeEnumeration],
  );
  const furtherNames = useMemo(
    () => getFurtherNames(activeEnumeration),
    [activeEnumeration],
  );
  const activeEnum = getEnumerationById(activeEnumeration);

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
  listContent: {
    paddingBottom: 40,
  },
});
