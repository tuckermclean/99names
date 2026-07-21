/**
 * MeaningBlock — renders the bundled meaning_long text (and, by extension,
 * any other bundled markdown field passed to it, e.g. an enumeration `note`).
 * Always shows immediately (bundled, no spinner). SPEC §3.2.
 * `meaning_long` / `note` are markdown (SPEC §2.2, §2.3) — headings, emphasis,
 * and lists are rendered via react-native-markdown-display, themed and
 * font-scaled to match the rest of the app. Marks placeholder text with a
 * visible warning for the dev scaffold; placeholder strings contain no
 * markdown syntax so they simply render as a plain paragraph.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import BodyText from './BodyText';
import { useTheme } from '../theme/ThemeProvider';
import { bodyTextStyle } from '../theme/typography';
import type { ColorTokens, TypeScale } from '../theme/tokens';

interface Props {
  text: string;
  /**
   * 'detail' (default): sits directly under other Detail-screen content and
   * draws its own top divider.
   * 'reading': embedded in ReadingScreen, which already renders its own
   * divider above the article body, so the block's own border is omitted.
   */
  variant?: 'detail' | 'reading';
}

const PLACEHOLDER_PREFIX = '[PLACEHOLDER';

const monospace = Platform.select({ ios: 'Courier', android: 'monospace' });

/** Maps react-native-markdown-display's style keys onto the app's theme
 * tokens and type scale, so markdown content matches the surrounding
 * typography, colors, and current fontScale exactly. */
function buildMarkdownStyles(colors: ColorTokens, typeScale: TypeScale) {
  const bodySize = typeScale.body;

  return StyleSheet.create({
    body: {
      color: colors.text,
    },
    paragraph: {
      ...bodyTextStyle(bodySize),
      color: colors.text,
      marginTop: 0,
      marginBottom: 16,
      width: '100%',
    },
    text: {
      ...bodyTextStyle(bodySize),
      color: colors.text,
    },
    heading1: {
      ...bodyTextStyle(Math.round(bodySize * 1.5)),
      color: colors.text,
      fontWeight: '700',
      marginTop: 8,
      marginBottom: 8,
    },
    heading2: {
      ...bodyTextStyle(Math.round(bodySize * 1.35)),
      color: colors.text,
      fontWeight: '700',
      marginTop: 8,
      marginBottom: 8,
    },
    heading3: {
      ...bodyTextStyle(Math.round(bodySize * 1.2)),
      color: colors.text,
      fontWeight: '600',
      marginTop: 6,
      marginBottom: 6,
    },
    heading4: {
      ...bodyTextStyle(Math.round(bodySize * 1.1)),
      color: colors.text,
      fontWeight: '600',
      marginTop: 6,
      marginBottom: 6,
    },
    heading5: {
      ...bodyTextStyle(bodySize),
      color: colors.textMuted,
      fontWeight: '600',
    },
    heading6: {
      ...bodyTextStyle(Math.round(bodySize * 0.9)),
      color: colors.textMuted,
      fontWeight: '600',
    },
    strong: {
      fontWeight: '700',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecorationLine: 'line-through',
    },
    link: {
      color: colors.accent,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: colors.tagBackground,
      borderColor: colors.border,
      borderLeftWidth: 3,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    list_item: {
      marginBottom: 6,
    },
    bullet_list_icon: {
      color: colors.text,
      marginRight: 8,
    },
    bullet_list_content: {
      ...bodyTextStyle(bodySize),
      color: colors.text,
    },
    ordered_list_icon: {
      color: colors.text,
      marginRight: 8,
    },
    ordered_list_content: {
      ...bodyTextStyle(bodySize),
      color: colors.text,
    },
    code_inline: {
      fontFamily: monospace,
      fontSize: Math.round(bodySize * 0.9),
      color: colors.text,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    code_block: {
      fontFamily: monospace,
      fontSize: Math.round(bodySize * 0.9),
      color: colors.text,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 6,
      padding: 10,
    },
    fence: {
      fontFamily: monospace,
      fontSize: Math.round(bodySize * 0.9),
      color: colors.text,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 6,
      padding: 10,
    },
    hr: {
      backgroundColor: colors.border,
      height: StyleSheet.hairlineWidth,
      marginVertical: 12,
    },
  });
}

export default function MeaningBlock({ text, variant = 'detail' }: Props) {
  const { colors, typeScale } = useTheme();
  const isPlaceholder = text.trimStart().startsWith(PLACEHOLDER_PREFIX);

  const markdownStyles = useMemo(
    () => buildMarkdownStyles(colors, typeScale),
    [colors, typeScale],
  );

  return (
    <View
      style={[
        styles.container,
        variant === 'detail' && [styles.detailBorder, { borderTopColor: colors.border }],
      ]}
    >
      {isPlaceholder && (
        <View style={[styles.warning, { backgroundColor: colors.tagBackground, borderColor: colors.warning }]}>
          <BodyText size="caption" style={{ color: colors.warning }}>
            ⚠ Dev scaffold — content pending scholarly review (SPEC §9)
          </BodyText>
        </View>
      )}
      {/* Bundled markdown content — no network, presentational only. Guard
          against an accidental link inside the meaning text ever opening the
          network implicitly; tafsir links are the only sanctioned network
          surface (AGENTS.md §Network). */}
      <Markdown style={markdownStyles} onLinkPress={() => false}>
        {text}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  warning: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
});
