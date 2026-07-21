/**
 * Behavioral tests for the Settings reducer, exercised through
 * SettingsProvider + useSettings (the reducer itself is not exported).
 *
 * A tiny probe component renders inside the provider and exposes the
 * current settings + a dispatch trigger via testID-tagged elements, so
 * each test can assert on rendered state and drive actions through
 * fireEvent, exactly like a real consumer would.
 */

import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';

import { SettingsProvider, useSettings, actions } from './SettingsContext';

function Probe({ onDispatchReady }: { onDispatchReady?: (d: any) => void }) {
  const { settings, dispatch, isHydrated } = useSettings();
  React.useEffect(() => {
    onDispatchReady?.(dispatch);
  }, [dispatch, onDispatchReady]);

  return (
    <>
      <Text testID="hydrated">{String(isHydrated)}</Text>
      <Text testID="activeEnumeration">{settings.activeEnumeration}</Text>
      <Text testID="theme">{settings.theme}</Text>
      <Text testID="fontScale">{settings.fontScale}</Text>
      <Text testID="showTransliteration">
        {String(settings.showTransliteration)}
      </Text>
      <Text testID="autoplay">{String(settings.audioPrefs.autoplay)}</Text>
      <Text testID="playAllSequence">
        {String(settings.audioPrefs.playAllSequence)}
      </Text>
      <Text testID="lastReadNameId">{String(settings.lastReadNameId)}</Text>
      <Text testID="bookmarks">{JSON.stringify(settings.bookmarks)}</Text>
      <Pressable
        testID="toggle-bookmark-al-hayy"
        onPress={() => dispatch(actions.toggleBookmark('al_hayy'))}
      >
        <Text>toggle</Text>
      </Pressable>
    </>
  );
}

async function renderProbe(onDispatchReady?: (d: any) => void) {
  const utils = await render(
    <SettingsProvider>
      <Probe onDispatchReady={onDispatchReady} />
    </SettingsProvider>,
  );
  // Wait for the async AsyncStorage-backed hydration to complete so tests
  // observe settled state rather than the pre-hydration default render.
  await waitFor(() => {
    expect(utils.getByTestId('hydrated').props.children).toBe('true');
  });
  return utils;
}

describe('SettingsProvider / reducer', () => {
  it('hydrates with default settings when nothing is persisted', async () => {
    const { getByTestId } = await renderProbe();
    expect(getByTestId('theme').props.children).toBe('light');
    expect(getByTestId('fontScale').props.children).toBe('medium');
    expect(getByTestId('showTransliteration').props.children).toBe('true');
    expect(getByTestId('autoplay').props.children).toBe('false');
    expect(getByTestId('playAllSequence').props.children).toBe('false');
    expect(getByTestId('lastReadNameId').props.children).toBe('null');
    expect(getByTestId('bookmarks').props.children).toBe('[]');
  });

  it('TOGGLE_BOOKMARK adds an id, then removes it on a second toggle', async () => {
    const { getByTestId } = await renderProbe();

    await act(() => {
      fireEvent.press(getByTestId('toggle-bookmark-al-hayy'));
    });
    expect(JSON.parse(getByTestId('bookmarks').props.children)).toEqual([
      'al_hayy',
    ]);

    await act(() => {
      fireEvent.press(getByTestId('toggle-bookmark-al-hayy'));
    });
    expect(JSON.parse(getByTestId('bookmarks').props.children)).toEqual([]);
  });

  it('SET_LAST_READ updates lastReadNameId', async () => {
    let dispatch: any;
    const { getByTestId } = await renderProbe((d) => (dispatch = d));

    await act(() => {
      dispatch(actions.setLastRead('ar_rahman'));
    });
    expect(getByTestId('lastReadNameId').props.children).toBe('ar_rahman');

    await act(() => {
      dispatch(actions.setLastRead(null));
    });
    expect(getByTestId('lastReadNameId').props.children).toBe('null');
  });

  it('SET_ACTIVE_ENUMERATION (setEnumeration) updates activeEnumeration', async () => {
    let dispatch: any;
    const utils = await renderProbe((d) => (dispatch = d));

    await act(() => {
      dispatch(actions.setEnumeration('ibn_majah'));
    });
    expect(utils.getByTestId('activeEnumeration').props.children).toBe(
      'ibn_majah',
    );
  });

  it('theme, fontScale, and transliteration updates apply independently', async () => {
    let dispatch: any;
    const utils = await renderProbe((d) => (dispatch = d));

    await act(() => {
      dispatch(actions.setTheme('dark'));
    });
    expect(utils.getByTestId('theme').props.children).toBe('dark');

    await act(() => {
      dispatch(actions.setFontScale('xlarge'));
    });
    expect(utils.getByTestId('fontScale').props.children).toBe('xlarge');

    await act(() => {
      dispatch(actions.setShowTransliteration(false));
    });
    expect(utils.getByTestId('showTransliteration').props.children).toBe(
      'false',
    );

    await act(() => {
      dispatch(actions.setAudioAutoplay(true));
    });
    expect(utils.getByTestId('autoplay').props.children).toBe('true');

    await act(() => {
      dispatch(actions.setAudioPlayAll(true));
    });
    expect(utils.getByTestId('playAllSequence').props.children).toBe('true');
  });
});
