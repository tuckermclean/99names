/**
 * TafsirLinkList — external tafsir links in the Reading view.
 * These are the ONLY place the network is used (user-initiated, explicit).
 * Each link is visibly labeled as external and degrades gracefully offline.
 * SPEC §3.3, §6, AGENTS.md §Network.
 */

import React, { useState, useCallback } from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import BodyText from './BodyText';
import { useTheme } from '../theme/ThemeProvider';
import type { TafsirLink } from '../data/types';

interface Props {
  links: TafsirLink[];
}

async function isNetworkAvailable(): Promise<boolean> {
  // Lightweight connectivity check — we import expo-network lazily
  // so it doesn't load on every screen. SPEC §6: no network at launch.
  try {
    const { getNetworkStateAsync } = await import('expo-network');
    const state = await getNetworkStateAsync();
    return state.isInternetReachable === true;
  } catch {
    return true; // Optimistic if we can't check — let the OS handle the error
  }
}

interface LinkItemProps {
  link: TafsirLink;
}

function LinkItem({ link }: LinkItemProps) {
  const { colors } = useTheme();
  const [offlineError, setOfflineError] = useState(false);

  const handlePress = useCallback(async () => {
    setOfflineError(false);
    const online = await isNetworkAvailable();
    if (!online) {
      setOfflineError(true);
      return;
    }
    try {
      await Linking.openURL(link.url);
    } catch {
      setOfflineError(true);
    }
  }, [link.url]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.item,
        { borderColor: colors.border, backgroundColor: colors.surface },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="link"
      accessibilityLabel={`${link.label} from ${link.source_name} — opens externally, requires connection`}
    >
      <View style={styles.itemHeader}>
        <BodyText size="label" style={[styles.label, { color: colors.accent }]}>
          {link.label}
        </BodyText>
        {/* External icon (text-based, not color-only) */}
        <BodyText size="caption" style={[styles.externalTag, { color: colors.textMuted }]}>
          ↗ External
        </BodyText>
      </View>
      <BodyText size="caption" muted>
        {link.source_name}
      </BodyText>
      <BodyText size="caption" muted style={styles.networkNote}>
        🔗 Requires a network connection
      </BodyText>
      {offlineError && (
        <BodyText size="caption" style={{ color: colors.warning, marginTop: 4 }}>
          No connection available — please try again when online.
        </BodyText>
      )}
    </Pressable>
  );
}

export default function TafsirLinkList({ links }: Props) {
  const { colors } = useTheme();

  if (links.length === 0) {
    return (
      <View style={[styles.empty, { borderTopColor: colors.border }]}>
        <BodyText size="caption" muted>
          No external tafsir links have been added for this name yet.
        </BodyText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <BodyText
        size="caption"
        style={[styles.heading, { color: colors.textMuted }]}
      >
        FURTHER READING (EXTERNAL)
      </BodyText>
      {links.map((link, i) => (
        <LinkItem key={i} link={link} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  heading: {
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  item: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '500',
    flex: 1,
  },
  externalTag: {
    marginLeft: 8,
  },
  networkNote: {
    marginTop: 2,
  },
  empty: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
