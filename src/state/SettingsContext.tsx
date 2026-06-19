/**
 * Settings context — single source of truth for user preferences.
 * Wraps the app and exposes settings + a typed dispatch. STRUCTURE §4.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Settings, Theme, FontScale } from '../data/types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './persistence';

// ─── Action types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'HYDRATE'; payload: Settings }
  | { type: 'SET_ENUMERATION'; enumId: string }
  | { type: 'SET_THEME'; theme: Theme }
  | { type: 'SET_FONT_SCALE'; fontScale: FontScale }
  | { type: 'SET_SHOW_TRANSLITERATION'; show: boolean }
  | { type: 'SET_AUDIO_AUTOPLAY'; autoplay: boolean }
  | { type: 'SET_AUDIO_PLAY_ALL'; playAll: boolean }
  | { type: 'SET_LAST_READ'; nameId: string | null }
  | { type: 'TOGGLE_BOOKMARK'; nameId: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'SET_ENUMERATION':
      return { ...state, activeEnumeration: action.enumId };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SET_FONT_SCALE':
      return { ...state, fontScale: action.fontScale };

    case 'SET_SHOW_TRANSLITERATION':
      return { ...state, showTransliteration: action.show };

    case 'SET_AUDIO_AUTOPLAY':
      return {
        ...state,
        audioPrefs: { ...state.audioPrefs, autoplay: action.autoplay },
      };

    case 'SET_AUDIO_PLAY_ALL':
      return {
        ...state,
        audioPrefs: { ...state.audioPrefs, playAllSequence: action.playAll },
      };

    case 'SET_LAST_READ':
      return { ...state, lastReadNameId: action.nameId };

    case 'TOGGLE_BOOKMARK': {
      const existing = state.bookmarks.includes(action.nameId);
      const bookmarks = existing
        ? state.bookmarks.filter((id) => id !== action.nameId)
        : [...state.bookmarks, action.nameId];
      return { ...state, bookmarks };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: Settings;
  dispatch: React.Dispatch<Action>;
  isHydrated: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  dispatch: () => {},
  isHydrated: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
}

export function SettingsProvider({ children }: Props) {
  const [settings, dispatch] = useReducer(reducer, DEFAULT_SETTINGS);
  const isHydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load persisted settings once on mount
  useEffect(() => {
    loadSettings().then((loaded) => {
      dispatch({ type: 'HYDRATE', payload: loaded });
      isHydratedRef.current = true;
      setIsHydrated(true);
    });
  }, []);

  // Persist on every change after hydration
  useEffect(() => {
    if (!isHydratedRef.current) return;
    saveSettings(settings);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, dispatch, isHydrated }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

// ─── Typed action creators (convenience, not required) ────────────────────────

export const actions = {
  setEnumeration: (enumId: string): Action => ({
    type: 'SET_ENUMERATION',
    enumId,
  }),
  setTheme: (theme: Theme): Action => ({ type: 'SET_THEME', theme }),
  setFontScale: (fontScale: FontScale): Action => ({
    type: 'SET_FONT_SCALE',
    fontScale,
  }),
  setShowTransliteration: (show: boolean): Action => ({
    type: 'SET_SHOW_TRANSLITERATION',
    show,
  }),
  setAudioAutoplay: (autoplay: boolean): Action => ({
    type: 'SET_AUDIO_AUTOPLAY',
    autoplay,
  }),
  setAudioPlayAll: (playAll: boolean): Action => ({
    type: 'SET_AUDIO_PLAY_ALL',
    playAll,
  }),
  setLastRead: (nameId: string | null): Action => ({
    type: 'SET_LAST_READ',
    nameId,
  }),
  toggleBookmark: (nameId: string): Action => ({
    type: 'TOGGLE_BOOKMARK',
    nameId,
  }),
};
