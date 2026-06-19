/**
 * Thin audio service wrapping expo-audio.
 * All consumers call this service; nothing touches expo-audio directly.
 * SPEC §5, STRUCTURE §5, AGENTS.md §Audio.
 *
 * Rules (AGENTS.md):
 *  - Bundled assets only — no streaming, no network.
 *  - Continue playing across Detail ↔ Reading navigation.
 *  - Stop when the user returns to the List (NamesListScreen calls stop()).
 *  - Respect device silent switch; duck/pause other audio.
 */

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, AudioStatus } from 'expo-audio';
import manifest from './audioManifest';

// ─── State types ──────────────────────────────────────────────────────────────

export type AudioPlayerState =
  | { status: 'idle' }
  | { status: 'loading'; nameId: string }
  | { status: 'playing'; nameId: string }
  | { status: 'paused'; nameId: string }
  | { status: 'error'; nameId: string; message: string };

type Subscriber = (state: AudioPlayerState) => void;

// ─── Internal state ───────────────────────────────────────────────────────────

let _player: AudioPlayer | null = null;
let _subscription: { remove: () => void } | null = null;
let _currentNameId: string | null = null;
let _sequenceIds: string[] | null = null;
let _subscribers: Subscriber[] = [];
let _state: AudioPlayerState = { status: 'idle' };
let _audioModeConfigured = false;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setState(next: AudioPlayerState) {
  _state = next;
  for (const sub of _subscribers) {
    try {
      sub(next);
    } catch {
      // subscriber errors must not crash the player
    }
  }
}

async function configureAudioMode() {
  if (_audioModeConfigured) return;
  await setAudioModeAsync({
    playsInSilentMode: false,        // honour iOS silent switch
    interruptionMode: 'duckOthers',  // duck other audio on all platforms
    shouldPlayInBackground: false,
  });
  _audioModeConfigured = true;
}

function releaseCurrent() {
  if (_subscription) {
    try { _subscription.remove(); } catch { /* ignore */ }
    _subscription = null;
  }
  if (_player) {
    try { _player.remove(); } catch { /* ignore */ }
    _player = null;
  }
  _currentNameId = null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Subscribe to state changes. Returns an unsubscribe function.
 */
export function subscribe(fn: Subscriber): () => void {
  _subscribers.push(fn);
  // Emit current state immediately so the subscriber gets an initial value
  fn(_state);
  return () => {
    _subscribers = _subscribers.filter((s) => s !== fn);
  };
}

export function getState(): AudioPlayerState {
  return _state;
}

/**
 * Play the audio for a given nameId.
 * If the same name is already playing, this is a no-op.
 * If another name is playing, it stops and starts the new one.
 */
export async function play(nameId: string): Promise<void> {
  // Already playing this name
  if (_state.status === 'playing' && _currentNameId === nameId) return;

  const asset = manifest[nameId];
  if (!asset) {
    setState({ status: 'error', nameId, message: 'No audio asset for this name' });
    return;
  }

  try {
    setState({ status: 'loading', nameId });
    await configureAudioMode();
    releaseCurrent();

    const p = createAudioPlayer(asset);
    _player = p;
    _currentNameId = nameId;

    // Listen for natural completion to drive sequence auto-advance or idle
    _subscription = p.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (!status.didJustFinish || _currentNameId !== nameId) return;

      if (_sequenceIds) {
        const idx = _sequenceIds.indexOf(nameId);
        if (idx >= 0 && idx < _sequenceIds.length - 1) {
          play(_sequenceIds[idx + 1]);
          return;
        } else {
          _sequenceIds = null;
        }
      }
      setState({ status: 'idle' });
      releaseCurrent();
    });

    p.play();
    setState({ status: 'playing', nameId });
  } catch (err) {
    setState({
      status: 'error',
      nameId,
      message: err instanceof Error ? err.message : 'Playback error',
    });
  }
}

/**
 * Pause the currently playing audio.
 */
export async function pause(): Promise<void> {
  if (!_player || _currentNameId === null) return;
  try {
    _player.pause();
    setState({ status: 'paused', nameId: _currentNameId });
  } catch {
    // ignore
  }
}

/**
 * Resume paused audio.
 */
export async function resume(): Promise<void> {
  if (!_player || _currentNameId === null) return;
  if (_state.status !== 'paused') return;
  try {
    _player.play();
    setState({ status: 'playing', nameId: _currentNameId });
  } catch {
    // ignore
  }
}

/**
 * Stop playback and release resources.
 * Called by NamesListScreen on focus (AGENTS.md rule: stop on return to List).
 */
export async function stop(): Promise<void> {
  _sequenceIds = null;
  releaseCurrent();
  setState({ status: 'idle' });
}

/**
 * Play a sequence of names one after another.
 * Stops any currently playing audio first.
 */
export async function playSequence(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  _sequenceIds = ids;
  await play(ids[0]);
}

/**
 * Toggle play/pause for a given nameId.
 * If a different name is playing, switch to the new one.
 */
export async function togglePlay(nameId: string): Promise<void> {
  if (_state.status === 'playing' && _currentNameId === nameId) {
    await pause();
  } else if (_state.status === 'paused' && _currentNameId === nameId) {
    await resume();
  } else {
    await play(nameId);
  }
}
