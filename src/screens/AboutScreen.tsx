/**
 * AboutScreen — required content per SPEC §9 and AGENTS.md.
 * Lists every enumeration + sources, translation, reciter, font licenses.
 * States plainly that Allah's names are not limited to ninety-nine.
 * Privacy statement: no analytics, no accounts, all state on-device.
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { getAllEnumerations, CONTENT_VERSION } from '../data/access';
import BodyText from '../components/BodyText';

function Heading({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <BodyText
      size="caption"
      style={[styles.heading, { color: colors.textMuted }]}
    >
      {children.toUpperCase()}
    </BodyText>
  );
}

function Para({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <BodyText size="body" style={[styles.para, { color: colors.text }]}>
      {children}
    </BodyText>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

export default function AboutScreen() {
  const { colors } = useTheme();
  const enumerations = getAllEnumerations();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* The most important statement in the app */}
      <View style={[styles.statement, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}>
        <Para>
          Allah's beautiful names are not limited to ninety-nine. The Prophet
          (peace be upon him) said that Allah has names known only to Himself,
          hidden in the knowledge of the unseen. This app presents ninety-nine
          names as a corpus drawn from recognized scholarly enumerations, and
          treats all names in that corpus with equal dignity.
        </Para>
        <BodyText size="caption" muted style={{ marginTop: 6 }}>
          [PLACEHOLDER — this statement must be reviewed and confirmed by a
          qualified scholar before public release. See SPEC §9.]
        </BodyText>
      </View>

      <Divider />

      {/* Enumerations */}
      <Heading>Enumerations</Heading>
      {enumerations.map((e) => (
        <View key={e.id} style={styles.block}>
          <BodyText
            size="label"
            style={[styles.enumTitle, { color: colors.text }]}
          >
            {e.title}
          </BodyText>
          <Para>{e.source}</Para>
          <Para>{e.note}</Para>
        </View>
      ))}

      <Divider />

      {/* Translation */}
      <Heading>English Translation</Heading>
      <Para>
        [PLACEHOLDER — the final English translation source has not yet been
        selected. See SPEC §12. Credit will be given here before release.]
      </Para>

      <Divider />

      {/* Quran edition */}
      <Heading>Quran Verse Text</Heading>
      <Para>
        [PLACEHOLDER — the Quran edition for verse text has not yet been
        selected. See SPEC §12. Credit and edition information will appear here
        before release.]
      </Para>

      <Divider />

      {/* Recitation audio */}
      <Heading>Recitation Audio</Heading>
      <Para>
        The audio in this development build consists of placeholder clips only.
        Before public release, each name will carry a licensed recitation from a
        credited reciter. Full attribution will appear here.
      </Para>
      <Para>
        [PLACEHOLDER — reciter credit, audio rights confirmation, and individual
        clip attribution pending. See SPEC §9, §12.]
      </Para>

      <Divider />

      {/* Arabic font */}
      <Heading>Arabic Font</Heading>
      <Para>
        The Arabic typeface used in this app is Amiri, designed by Khaled
        Hosny and released under the SIL Open Font License, Version 1.1.
        Amiri is a classical Naskh typeface that renders ḥarakāt (vowel marks)
        correctly and was chosen to honour the dignity of the text.
      </Para>
      <Para>License: SIL Open Font License, Version 1.1 (OFL-1.1).</Para>

      <Divider />

      {/* Privacy */}
      <Heading>Privacy</Heading>
      <Para>
        This app collects no data. There are no analytics, no accounts, no
        third-party SDKs, and no network calls at launch or for any core
        function. All your settings (chosen enumeration, theme, font size,
        bookmarks) are stored on your device only and never transmitted anywhere.
      </Para>

      <Divider />

      {/* Content version */}
      <Heading>Content Version</Heading>
      <Para>{`Corpus & enumeration data version: ${CONTENT_VERSION}`}</Para>
      <Para>
        This is a development scaffold. All content marked [PLACEHOLDER] must
        be reviewed by a qualified scholar and replaced before any public release.
      </Para>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  statement: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  heading: {
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
  },
  para: {
    lineHeight: 24,
    marginBottom: 8,
  },
  block: {
    marginBottom: 16,
  },
  enumTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
});
