# 99 Beautiful Names — React Native Screen Structure

*Companion to the app spec. Maps the spec's screens onto a concrete React Native navigation, component, and state layout. MVP-scoped — a buildable scaffold, not an exhaustive implementation.*

---

## 1. Navigation architecture

One native stack (React Navigation `@react-navigation/native-stack`). The stack gives correct back behavior for free — Android hardware back and iOS swipe both pop the stack — which satisfies the spec's §4 requirements without custom work.

```
RootStack (native stack)
│
├─ NamesList      (home)           ← initial route
├─ NameDetail     { nameId }
├─ Reading        { nameId }
├─ Settings
└─ About
```

Flow: `NamesList → NameDetail → Reading`, with `Settings` and `About` pushed from the top bar / settings. Back always unwinds Reading → Detail → List → exit. No nested navigators needed for the MVP.

```ts
// navigation/types.ts
export type RootStackParamList = {
  NamesList: undefined;
  NameDetail: { nameId: string };
  Reading: { nameId: string };
  Settings: undefined;
  About: undefined;
};
```

```tsx
// navigation/RootNavigator.tsx
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="NamesList"
      screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}
    >
      <Stack.Screen name="NamesList" component={NamesListScreen} options={{ title: 'The Beautiful Names' }} />
      <Stack.Screen name="NameDetail" component={NameDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Reading" component={ReadingScreen} options={{ title: '' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About & Sources' }} />
    </Stack.Navigator>
  );
}
```

### Prev/Next without deepening the back stack

The spec (§4) requires that flipping between names with Prev/Next does **not** stack history — back from any name returns to the list. Implement this by updating the current route's param in place rather than pushing:

```ts
// inside NameDetailScreen
const goToName = (id: string) => navigation.setParams({ nameId: id });
// Next/Prev call goToName(...) — the route stays the same, only nameId changes,
// so the back stack is still [NamesList, NameDetail].
```

Traversal order for Prev/Next follows the list order: the active enumeration's 99 first, then Further Names (see §4 data selectors).

---

## 2. Screens

Each screen below notes what it renders and the spec section it implements. Screens are thin: they pull data via selectors and settings via context, and compose shared components (§3).

### `NamesListScreen` — home (spec §3.1)
- Two `SectionList` sections: **The 99 (active enumeration)** and **Further Names**.
- Section headers: the active-enumeration header is tappable → `Settings`. The Further Names header carries the short respectful intro line.
- Renders `NameRow` per item; numbered rows in the 99, unnumbered in Further Names.
- Top bar: title, search/jump button, settings button. Optional "Resume" → last-read `NameDetail`.
- Tap a row → `navigation.navigate('NameDetail', { nameId })`.

### `NameDetailScreen` — one name (spec §3.2)
- Param: `nameId`. Reads the name record + active settings.
- Composes: `NameHeader` (Arabic / transliteration / translation), `AudioButton`, `ProvenanceLine` (always fully shown), `MeaningBlock`, `QuranRefList`, a **More** button → `Reading`, and a `PrevNextBar`.
- `PrevNextBar` uses `goToName` (param swap, §1).
- Respects the transliteration toggle from settings.

### `ReadingScreen` — deep content (spec §3.3)
- Param: `nameId`. Long-form article (`meaning_long`) + `TafsirLinkList`.
- Tafsir links open externally via `Linking.openURL`; each marked as leaving the app / needing network, and disabled-with-note when offline.

### `SettingsScreen` (spec §7)
- `EnumerationPicker` (Tirmidhī / Ibn Mājah; descriptive, not "correct vs wrong").
- Font-size control, theme switch (light / dark / sepia), transliteration toggle.
- Audio preferences (e.g. autoplay on open, play-all sequence).
- Link → `About`.

### `AboutScreen` (spec §9)
- Lists enumerations + sources, translation, reciter, font licenses.
- States plainly that Allah's names are not limited to ninety-nine.

---

## 3. Shared components

Small, presentational, theme-aware. No data fetching inside them — they take props.

| Component | Used by | Notes |
|---|---|---|
| `NameRow` | NamesList | Arabic + translit + translation; optional index badge. |
| `NameHeader` | NameDetail | The large Arabic focal block + translit + translation. |
| `AudioButton` | NameRow, NameDetail | Play/pause + playing state; calls the audio service (§5). |
| `ProvenanceLine` | NameDetail | Quiet styling, full text; "Tirmidhī #14 · Ibn Mājah #16". |
| `MeaningBlock` | NameDetail | Renders bundled `meaning_long`. |
| `QuranRefList` | NameDetail | Verse refs + bundled verse text. |
| `TafsirLinkList` | Reading | External links with source label + offline state. |
| `PrevNextBar` | NameDetail | Prev/Next via param swap. |
| `SectionHeader` | NamesList, Settings | Reused section/group header. |
| `ArabicText` / `BodyText` | everywhere | Typed text wrappers carrying font family, scale, and writing direction. |

---

## 4. State & data

Keep it light for the MVP — no Redux.

### Bundled data + selectors
- `data/corpus.json`, `data/enumerations.json` loaded once at startup into an in-memory module.
- `data/access.ts` exposes pure selectors:
  - `getNameById(id)`
  - `getActiveList(enumId)` → ordered 99
  - `getFurtherNames(enumId)` → corpus minus the active enumeration
  - `getTraversalOrder(enumId)` → `[...active99, ...further]` for Prev/Next
  - `getEnumerationMembership(id)` → `[{ enumId, index }]` for `ProvenanceLine`

### Settings context
A single `SettingsProvider` (Context + `useReducer`) holding: `activeEnumeration`, `theme`, `fontScale`, `showTransliteration`, audio prefs. Exposed via `useSettings()`.

### Persistence
`AsyncStorage` (default) for: settings, bookmarks, last-read `nameId`. Hydrate on launch, write on change. (MMKV is a faster optional swap later; not needed for MVP.)

> Data flows one way: settings live in context → screens read them → selectors derive the active/further partition from the constant corpus. Switching enumeration only re-derives; it never mutates data.

---

## 5. Audio service

A thin `audio/player.ts` wrapping one library, so screens never touch the library directly.
- API: `play(nameId)`, `pause()`, `stop()`, `playSequence(ids)`, plus a subscribable `state` (idle / playing / paused + current id) that `AudioButton` reads.
- Plays **bundled** assets only — no network (spec §5). Placeholder clips for now, same wiring as final assets.
- Respects the silent switch and ducks/pauses other audio.
- Library choice depends on Expo vs bare RN (see §8 open items) — `expo-av` if Expo, `react-native-track-player` if bare. The service interface stays the same either way.

---

## 6. Theme & typography

- `theme/` holds tokens: color sets per theme (light / dark / sepia), the type scale, and the bundled Arabic font family.
- `ThemeProvider` + `useTheme()`; `ArabicText`/`BodyText` consume theme + `fontScale` so a single setting scales everything.
- **RTL handling:** do *not* force global RTL with `I18nManager.forceRTL` — the UI chrome is English/LTR. Render Arabic at the text level with `writingDirection: 'rtl'` and appropriate alignment, so Arabic and Latin coexist correctly on the same screen.

---

## 7. Folder structure

```
src/
├─ navigation/
│  ├─ RootNavigator.tsx
│  └─ types.ts
├─ screens/
│  ├─ NamesListScreen.tsx
│  ├─ NameDetailScreen.tsx
│  ├─ ReadingScreen.tsx
│  ├─ SettingsScreen.tsx
│  └─ AboutScreen.tsx
├─ components/        # NameRow, NameHeader, AudioButton, ProvenanceLine, …
├─ data/
│  ├─ corpus.json
│  ├─ enumerations.json
│  └─ access.ts
├─ state/
│  ├─ SettingsContext.tsx
│  └─ persistence.ts
├─ audio/
│  └─ player.ts
├─ theme/
│  ├─ tokens.ts
│  ├─ ThemeProvider.tsx
│  └─ typography.ts
└─ assets/
   ├─ fonts/         # bundled Arabic + Latin faces
   └─ audio/         # one clip per corpus name (placeholders for now)
```

---

## 8. Dependencies & open items

**Core deps:** `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `@react-native-async-storage/async-storage`, an audio library (§5).

**Two small decisions that affect setup (not the structure above):**
1. **Expo vs bare React Native.** Expo is faster to start and fine for this app (bundled assets, simple audio, no exotic native modules); bare gives more control. This only changes the audio library and the build/asset pipeline.
2. **Bundled-asset strategy for audio** — `require()` per file vs a small manifest map; settle once when wiring `audio/player.ts`.

Neither blocks building the screens. If you want, I can scaffold any one screen end-to-end (e.g. `NamesListScreen` with its components and selectors) as the next step.
