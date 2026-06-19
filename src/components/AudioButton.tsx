/**
 * AudioButton — play/pause control for a single name's recitation.
 * Reads from the audio player's subscribable state so it's always in sync.
 * Uses icon + text (never color alone) for accessibility. SPEC §8.
 */

import React, { useEffect, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import BodyText from './BodyText';
import * as player from '../audio/player';
import type { AudioPlayerState } from '../audio/player';

interface Props {
  nameId: string;
  /** 'full' shows label; 'compact' shows only the icon glyph for list rows */
  variant?: 'full' | 'compact';
}

// Simple text-based icon (no icon library dependency)
function Icon({ glyph, color, size }: { glyph: string; color: string; size: number }) {
  return (
    <BodyText style={{ color, fontSize: size, lineHeight: size * 1.2 }}>
      {glyph}
    </BodyText>
  );
}

export default function AudioButton({ nameId, variant = 'full' }: Props) {
  const { colors } = useTheme();
  const [state, setState] = useState<AudioPlayerState>(player.getState());

  useEffect(() => {
    return player.subscribe(setState);
  }, []);

  const isThisPlaying = state.status === 'playing' && 'nameId' in state && state.nameId === nameId;
  const isThisPaused = state.status === 'paused' && 'nameId' in state && state.nameId === nameId;
  const isThisLoading = state.status === 'loading' && 'nameId' in state && state.nameId === nameId;

  async function handlePress() {
    await player.togglePlay(nameId);
  }

  const label = isThisPlaying ? 'Pause' : isThisPaused ? 'Resume' : 'Play';
  const glyph = isThisPlaying ? '⏸' : isThisPaused ? '▶' : '▶';

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compact,
          { minWidth: 44, minHeight: 44 },
          pressed && { opacity: 0.6 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label} recitation of this name`}
        accessibilityState={{ selected: isThisPlaying }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isThisLoading ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <Icon glyph={glyph} color={colors.accent} size={18} />
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.full,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isThisPlaying && { backgroundColor: colors.tagBackground },
        pressed && { opacity: 0.6 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label} recitation`}
      accessibilityState={{ selected: isThisPlaying }}
    >
      {isThisLoading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <View style={styles.row}>
          <Icon glyph={glyph} color={colors.accent} size={20} />
          <BodyText
            size="label"
            style={[styles.label, { color: colors.accent }]}
          >
            {label}
          </BodyText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compact: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  full: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '500',
  },
});
