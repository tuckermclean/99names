/**
 * AsyncStorage persistence for user settings, bookmarks, and last-read name.
 * All state stays on-device only. No network calls. SPEC §10, STRUCTURE §4.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../data/types';
import { DEFAULT_ENUMERATION_ID } from '../data/access';

const SETTINGS_KEY = '@99names/settings';

export const DEFAULT_SETTINGS: Settings = {
  activeEnumeration: DEFAULT_ENUMERATION_ID,
  theme: 'light',
  fontScale: 'medium',
  showTransliteration: true,
  audioPrefs: {
    autoplay: false,
    playAllSequence: false,
  },
  bookmarks: [],
  lastReadNameId: null,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    // Merge with defaults so new fields survive upgrades
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage errors are non-fatal; app keeps working
  }
}
