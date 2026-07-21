/**
 * SettingsScreen — user preferences. SPEC §7, STRUCTURE §2.
 * EnumerationPicker is descriptive and neutral — never "correct vs wrong".
 */

import React from 'react';
import {
  ScrollView,
  View,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSettings, actions } from '../state/SettingsContext';
import { useTheme } from '../theme/ThemeProvider';
import { getAllEnumerations } from '../data/access';
import BodyText from '../components/BodyText';
import type { Theme, FontScale } from '../data/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <BodyText
      size="caption"
      style={[styles.sectionLabel, { color: colors.textMuted }]}
    >
      {title.toUpperCase()}
    </BodyText>
  );
}

interface RowProps {
  label: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingRow({ label, description, selected, onPress, right }: RowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, backgroundColor: colors.surface },
        !!onPress && pressed && { opacity: 0.7 },
      ]}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityState={{ selected }}
    >
      <View style={styles.rowContent}>
        <BodyText size="label" style={{ color: colors.text }}>
          {label}
        </BodyText>
        {description ? (
          <BodyText size="caption" muted style={styles.rowDesc}>
            {description}
          </BodyText>
        ) : null}
      </View>
      {right ?? (selected ? <BodyText style={{ color: colors.accent, fontSize: 18 }}>✓</BodyText> : null)}
    </Pressable>
  );
}

const THEMES: { id: Theme; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'sepia', label: 'Sepia / Paper' },
];

const FONT_SCALES: { id: FontScale; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
  { id: 'xlarge', label: 'Extra Large' },
];

export default function SettingsScreen({ navigation }: Props) {
  const { settings, dispatch } = useSettings();
  const { colors } = useTheme();
  const enumerations = getAllEnumerations();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Enumeration picker */}
      <SectionLabel title="Active Enumeration" />
      <BodyText size="caption" muted style={styles.enumNote}>
        Choosing an enumeration determines which 99 names form the primary list
        and their order 1–99. Names in the corpus but not in this enumeration
        appear under "Further Names" — they are equally part of this app and
        carry the same complete content.
      </BodyText>
      {enumerations.map((e) => (
        <SettingRow
          key={e.id}
          label={e.title}
          description={e.note}
          selected={settings.activeEnumeration === e.id}
          onPress={() => dispatch(actions.setEnumeration(e.id))}
        />
      ))}

      {/* Theme */}
      <View style={styles.spacer} />
      <SectionLabel title="Theme" />
      {THEMES.map((t) => (
        <SettingRow
          key={t.id}
          label={t.label}
          selected={settings.theme === t.id}
          onPress={() => dispatch(actions.setTheme(t.id))}
        />
      ))}

      {/* Font size */}
      <View style={styles.spacer} />
      <SectionLabel title="Text Size" />
      {FONT_SCALES.map((f) => (
        <SettingRow
          key={f.id}
          label={f.label}
          selected={settings.fontScale === f.id}
          onPress={() => dispatch(actions.setFontScale(f.id))}
        />
      ))}

      {/* Transliteration */}
      <View style={styles.spacer} />
      <SectionLabel title="Display" />
      <SettingRow
        label="Show Transliteration"
        description="Display Latin transliteration (e.g. Ar-Raḥmān) in addition to Arabic"
        right={
          <Switch
            value={settings.showTransliteration}
            onValueChange={(v) => dispatch(actions.setShowTransliteration(v))}
            trackColor={{ true: colors.accent }}
            accessibilityLabel="Show transliteration"
          />
        }
      />

      {/* Audio */}
      <View style={styles.spacer} />
      <SectionLabel title="Audio" />
      <SettingRow
        label="Autoplay on Open"
        description="Begin recitation when you open a name"
        right={
          <Switch
            value={settings.audioPrefs.autoplay}
            onValueChange={(v) => dispatch(actions.setAudioAutoplay(v))}
            trackColor={{ true: colors.accent }}
            accessibilityLabel="Autoplay recitation on open"
          />
        }
      />
      <SettingRow
        label="Play All in Sequence"
        description="Play through all names one after another"
        right={
          <Switch
            value={settings.audioPrefs.playAllSequence}
            onValueChange={(v) => dispatch(actions.setAudioPlayAll(v))}
            trackColor={{ true: colors.accent }}
            accessibilityLabel="Play all names in sequence"
          />
        }
      />

      {/* About link */}
      <View style={styles.spacer} />
      <SettingRow
        label="About & Sources"
        onPress={() => navigation.navigate('About')}
        right={<BodyText style={{ color: colors.textMuted, fontSize: 18 }}>›</BodyText>}
      />

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 16 },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  enumNote: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  rowContent: { flex: 1, marginRight: 12 },
  rowDesc: { marginTop: 2, lineHeight: 18 },
  spacer: { height: 24 },
});
