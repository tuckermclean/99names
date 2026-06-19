/**
 * ProvenanceLine — shows where a name is attested and its enumeration membership.
 * Always shown in full on NameDetail; never truncated or hidden. SPEC §3.2.
 * Quiet in styling but fully readable. Uses dignified language for Further Names.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import BodyText from './BodyText';
import { useTheme } from '../theme/ThemeProvider';
import type { CorpusName, AttestationType } from '../data/types';
import { getAllEnumerations } from '../data/access';

interface Props {
  name: CorpusName;
}

function attestationLabel(attestations: AttestationType[]): string {
  const parts: string[] = [];
  if (attestations.includes('quran')) parts.push('Quran');
  if (attestations.includes('sunnah')) parts.push('Sunnah');
  return parts.join(' · ') || 'Attested';
}

export default function ProvenanceLine({ name }: Props) {
  const { colors } = useTheme();
  const allEnums = getAllEnumerations();
  const memberships = name.enumerations ?? [];

  // Build "Tirmidhī #14 · Ibn Mājah #16" string
  const membershipText = memberships
    .map(({ enumId, index }) => {
      const e = allEnums.find((e) => e.id === enumId);
      const shortTitle = e ? e.title.replace(' enumeration', '') : enumId;
      return `${shortTitle} #${index}`;
    })
    .join(' · ');

  const attLabel = attestationLabel(name.attestation);

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <BodyText size="caption" style={[styles.line, { color: colors.textMuted }]}>
        <BodyText
          size="caption"
          style={{ fontWeight: '600', color: colors.textMuted }}
        >
          Attested in:{' '}
        </BodyText>
        {attLabel}
      </BodyText>

      {membershipText ? (
        <BodyText size="caption" style={[styles.line, { color: colors.textMuted }]}>
          <BodyText
            size="caption"
            style={{ fontWeight: '600', color: colors.textMuted }}
          >
            Enumerated:{' '}
          </BodyText>
          {membershipText}
        </BodyText>
      ) : (
        <BodyText size="caption" style={[styles.line, { color: colors.textMuted }]}>
          This name is attested in the corpus but does not appear in the currently
          loaded enumerations.
        </BodyText>
      )}

      {name.root ? (
        <BodyText size="caption" style={[styles.line, { color: colors.textMuted }]}>
          <BodyText
            size="caption"
            style={{ fontWeight: '600', color: colors.textMuted }}
          >
            Root:{' '}
          </BodyText>
          <BodyText size="caption" accessibilityLanguage="ar" style={{ color: colors.textMuted }}>
            {name.root}
          </BodyText>
        </BodyText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  line: {
    lineHeight: 20,
  },
});
