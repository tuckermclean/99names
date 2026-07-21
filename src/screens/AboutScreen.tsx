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
          Based on the ḥadīth in which the Prophet (peace be upon him) taught
          that Allah has names He has kept in the knowledge of the unseen.
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
        English verse translations are from the Saheeh International translation
        of the Qurʾān, reproduced via QuranEnc.com in accordance with their
        terms of use. The short meanings and explanatory text are the app's own
        original prose (see “Meanings” below).
      </Para>

      <Divider />

      {/* Quran edition */}
      <Heading>Quran Verse Text</Heading>
      <Para>
        Arabic verse text is the Tanzil Uthmānī text, reproduced verbatim from
        tanzil.net in accordance with their terms of use. It is fully vowelled
        (with ḥarakāt) and rendered in the Amiri Naskh typeface.
      </Para>

      <Divider />

      {/* Meanings */}
      <Heading>Meanings</Heading>
      <Para>
        The one-line translations and the longer explanations of each name are
        the app's own original prose, grounded in the themes of Imām
        al-Ghazālī's classical work Al-Maqṣad al-Asnā fī Sharḥ Asmāʾ Allāh
        al-Ḥusnā (public domain). They paraphrase and summarise; they do not
        reproduce any single copyrighted commentary.
      </Para>

      <Divider />

      {/* Recitation audio */}
      <Heading>Recitation Audio</Heading>
      <Para>
        The recitation clips bundled with this build are unlicensed placeholders
        used during development. Each will be replaced with a licensed recitation
        from a credited reciter before public release, and full attribution for
        every clip will appear in this section.
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
        Verse text and translations are reproduced from the sources credited
        above; the meanings and explanatory text are the app's own original
        prose grounded in al-Ghazālī. Recitation audio is still placeholder
        pending licensing. As a matter of respect for the subject, the text is
        offered for confirmation by a qualified scholar.
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
