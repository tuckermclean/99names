/**
 * Render smoke test — proves the filled content actually reaches the screen.
 * Mounts the real NameDetailScreen against the real corpus (inside the real
 * Settings + Theme providers) and asserts the promoted meaning_long, the
 * Quran reference, and the tafsir links render — with no placeholder leakage.
 *
 * Note: under this jest-expo / React 19 setup, `render` is async — await it.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Audio is a native surface; stub it so the screen renders headlessly.
jest.mock('../audio/player', () => ({
  getState: () => ({ status: 'idle' }),
  subscribe: () => () => {},
  play: jest.fn().mockResolvedValue(undefined),
  togglePlay: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
}));

import { SettingsProvider } from '../state/SettingsContext';
import { ThemeProvider } from '../theme/ThemeProvider';
import NameDetailScreen from './NameDetailScreen';
import TafsirLinkList from '../components/TafsirLinkList';
import { getNameById } from '../data/access';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function wrap(ui: React.ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <SettingsProvider>
        <ThemeProvider theme="light" fontScale="medium">
          {ui}
        </ThemeProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const navigation = { setParams: jest.fn(), navigate: jest.fn() } as any;
const routeFor = (nameId: string) =>
  ({ key: 'NameDetail-test', name: 'NameDetail', params: { nameId } } as any);

type Utils = Awaited<ReturnType<typeof render>>;
const asText = (utils: Utils): string => JSON.stringify(utils.toJSON());

describe('NameDetailScreen renders filled content', () => {
  it('shows the promoted meaning_long and Quran reference for a real name', async () => {
    const utils = await render(
      wrap(<NameDetailScreen route={routeFor('al_wadud')} navigation={navigation} />),
    );

    await waitFor(() => {
      expect(asText(utils)).toContain('distinguished by al-Ghazālī');
    });

    const text = asText(utils);
    // Promoted meaning prose is present…
    expect(text).toContain('mercy responds to need');
    // …the Quran reference section renders with real Arabic + translation…
    expect(text).toContain('QURAN REFERENCES');
    expect(text).toContain('وَدُودٌ'); // "Wadūd" in the vowelled verse text (11:90)
    expect(text).toContain('Merciful and Affectionate'); // Saheeh Intl of 11:90
    // …and nothing placeholder-ish leaked through.
    expect(text).not.toContain('[PLACEHOLDER');
    expect(text.toLowerCase()).not.toContain('pending scholarly review');
    expect(text).not.toContain('Dev scaffold');
  });

  it('renders real tafsir links from corpus data', async () => {
    const name = getNameById('al_wadud')!;
    expect(name.tafsir_links.length).toBeGreaterThan(0);

    const utils = await render(wrap(<TafsirLinkList links={name.tafsir_links} />));
    const text = asText(utils);

    expect(text).toContain('Qurʾān 11:90');
    expect(text).toContain('Quran.com');
    expect(text).not.toContain('No external tafsir links');
  });

  it('shows the hadith-of-99 tafsir link for a sunnah-only name', async () => {
    const name = getNameById('al_khafid')!; // not attested as an exact Quran word
    expect(name.quran_refs.length).toBe(0);

    const utils = await render(wrap(<TafsirLinkList links={name.tafsir_links} />));
    const text = asText(utils);

    expect(text).toContain('ninety-nine names');
    expect(text).toContain('Sunnah.com');
  });
});
