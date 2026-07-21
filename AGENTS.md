# AGENTS.md — 99 Beautiful Names

Orientation for any agent (or human) working in this repo.
**Source of truth:** [`SPEC.md`](./SPEC.md) (product spec) and [`STRUCTURE.md`](./STRUCTURE.md) (React Native layout). Those documents win over anything here. If they ever contradict AGENTS.md, update AGENTS.md.

---

## What this is

An offline-first, reverent reader for the *Asmā' al-Ḥusnā* — the Beautiful Names of Allah. Built in **React Native** (iOS + Android from one codebase). It is a *reader*: no gamification, no social features, no accounts. The experience must work completely in airplane mode; the network is touched only when the user explicitly taps an external tafsir link or uses Share.

---

## Non-negotiable principles (in priority order)

1. **Readability** — Arabic + translation render beautifully at any size. Typography is the core product; treat it as the most important asset.
2. **Usability** — Any name, any detail layer, in one or two taps. Navigation is never ambiguous.
3. **Offline-first** — The complete experience (names, translations, audio, core articles) ships *inside* the app. Network is never required and never called at launch.
4. **Authenticity of content** — This is sacred material. Text and audio come from vetted sources, are version-controlled, and are not editorialized. Framing copy (especially around the "99" concept) requires scholarly review before release — **this gate is non-negotiable**.

### The "99" concept — handle with care

The Sunnah affirms 99 Names and attaches great reward to enumerating them, but the *specific list* varies across recognized enumerations. Allah's Names are also explicitly **not limited to ninety-nine** (hadith of the hidden names). The app honours both: the corpus is the *union* of multiple sound enumerations; the reader chooses which enumeration defines "the 99"; names outside the active enumeration ("Further Names") are presented with equal dignity — never as leftovers. See SPEC §2 and §3.1.

---

## Architecture at a glance

| Layer | What it is |
|---|---|
| **Content data** | Bundled JSON: `data/corpus.json`, `data/enumerations.json`. Read-only at runtime. Carries a content version number. |
| **Data selectors** | `data/access.ts` — pure functions: `getNameById`, `getActiveList`, `getFurtherNames`, `getTraversalOrder`, `getEnumerationMembership`. |
| **Navigation** | Single `@react-navigation/native-stack`. Five routes: `NamesList`, `NameDetail`, `Reading`, `Settings`, `About`. No nested navigators. |
| **State** | `SettingsProvider` (Context + `useReducer`): active enumeration, theme, fontScale, transliteration toggle, audio prefs. |
| **Persistence** | `AsyncStorage` for settings, bookmarks, last-read nameId. Hydrate on launch, write on change. |
| **Audio** | Thin `audio/player.ts` wrapping the chosen audio library. API: `play(nameId)`, `pause()`, `stop()`, `playSequence(ids)`, subscribable state. |
| **Theme / type** | `theme/` — color tokens per theme (light/dark/sepia), type scale, bundled Arabic font. `ThemeProvider` + `useTheme()`. |

Folder layout lives in [`STRUCTURE.md §7`](./STRUCTURE.md):

```
src/
├─ navigation/      RootNavigator.tsx, types.ts
├─ screens/         NamesListScreen, NameDetailScreen, ReadingScreen, SettingsScreen, AboutScreen
├─ components/      NameRow, NameHeader, AudioButton, ProvenanceLine, MeaningBlock, …
├─ data/            corpus.json, enumerations.json, access.ts
├─ state/           SettingsContext.tsx, persistence.ts
├─ audio/           player.ts
├─ theme/           tokens.ts, ThemeProvider.tsx, typography.ts
└─ assets/          fonts/, audio/
```

---

## Hard rules — easy to get wrong

### Network
- **Zero network calls** for core function. No analytics, no remote fetch on launch, no background refresh.
- Network is used *only* when the user taps an external tafsir link (Reading screen) or triggers Share. Both are explicit user actions. (SPEC §6)
- Tafsir links show a "requires connection" note when offline; they never throw or break the screen.

### Further Names (names outside the active 99)
- Every name in the corpus carries **full bundled content** — long meaning, Quran refs, audio, provenance. (SPEC §2.3)
- Further Names rows are **visually identical** to the 99 in quality. They differ only in lacking a 1–99 number. Never imply lesser status — not in copy, not in UI hierarchy, not in code shortcuts. (SPEC §3.1)

### Prev / Next navigation
- Prev/Next on `NameDetail` swaps the route *param in place* — it does **not** push a new screen. Back from any name returns to the list, not to a chain of names. (STRUCTURE §1, SPEC §4)
- Traversal order: active enumeration's 99 first, then Further Names.

```ts
// correct — param swap only
const goToName = (id: string) => navigation.setParams({ nameId: id });
```

### RTL / Arabic layout
- Do **not** call `I18nManager.forceRTL`. The UI chrome is English/LTR.
- Render Arabic RTL at the text level: `writingDirection: 'rtl'` + appropriate alignment inside `ArabicText` and `BodyText` wrappers. (STRUCTURE §6)

### Audio
- Bundled assets only. No streaming, no per-play network request. (SPEC §5)
- Continues playing across Detail ↔ Reading navigation; stops when the user returns to the List. State this rule once and enforce it everywhere.
- Respects device silent switch; ducks/pauses other audio.
- Placeholder clips ship for v1 (wired identically to final assets); licensed, credited reciter swapped in before public release.

### Content versioning
- Corpus + enumeration JSON files carry a visible content version number.
- Content corrections ship as a new app-store build — no in-app update mechanism for MVP. (SPEC §6)

### Arabic font
- Bundle a high-quality Naskh/Quranic typeface (renders ḥarakāt correctly). Do **not** rely on the system Arabic font. This is the single most important visual asset. (SPEC §7)

---

## Tech stack & open setup decisions

**Core dependencies:**
- `@react-navigation/native` + `@react-navigation/native-stack`
- `react-native-screens`, `react-native-safe-area-context`
- `@react-native-async-storage/async-storage`
- Audio library (see below)

**Two decisions that affect scaffolding — confirm before initialising the project:**

| Decision | Options | Consequence |
|---|---|---|
| Expo vs bare RN | Expo (faster start, fine for this app) / Bare (more control) | Drives audio library choice |
| Audio library | `expo-av` (if Expo) / `react-native-track-player` (if bare) | Both expose identical service API |
| Bundled audio strategy | `require()` per file at build time / manifest map | Decide once when wiring `audio/player.ts` |

Neither decision affects the screen structure, data layer, or component design.

---

## Out of scope for v1

No accounts/login, social/sharing feeds, notifications/streaks/gamification, quizzes, in-app purchases, cloud sync. (SPEC §11) Defer any such feature without debate.

---

## Working in this repo — execution contract (non-negotiable)

**All work is done by subagents. The lead agent does not.** This is a hard rule, not a preference:

- **Subagents run as Sonnet and do all execution** — every code edit, file write, shell command, and build step. Farm work out and run subagents **in parallel** to keep throughput high; keep busy rather than working serially.
- **The lead agent (Fable / Opus) does only two things: planning and final review.** It never writes code itself and never babysits a shell. If the lead is tempted to make an edit or run a command, that is a signal to spawn a subagent instead.
- **A recurring check-in loop (every 20–30 min) is in effect.** It exists so the lead returns periodically to check on farmed-out work and to **resume automatically after any session-limit interruption**. Hitting a session limit is expected and fine — come back and start again; do not treat it as failure.

**Spawning specialist agents in parallel is the default.** This project has clear, separable concerns; a well-aimed swarm moves faster than a single generalist working serially. Good divisions:

| Work area | Suggested specialist |
|---|---|
| Screen implementation, navigation, data selectors | **Frontend Developer** or **Mobile App Builder** |
| Typography, theming, RTL layout, design tokens | **UI Designer** |
| Accessibility (WCAG AA, screen-reader language tags) | **Accessibility Auditor** |
| Corpus JSON, enumeration data, framing copy review | Apply a scholarly/content reviewer mindset; flag any doctrinal phrasing for human scholar review before release |
| Audio service wiring | **Mobile App Builder** or **Backend Architect** (thin service layer) |
| Codebase exploration before a large change | **Explore** subagent |
| Implementation planning | **Plan** subagent |

**When spawning agents**, always point them at `SPEC.md` and `STRUCTURE.md` as the authoritative source of truth, and brief them on the hard rules in this file.

---

## Release gates — do not skip

Before any public release (SPEC §12):

- [ ] Settle the **final English translation** to standardise on, and the **Quran edition** for verse text — credit both in About.
- [ ] Confirm rights to **bundle the reciter's audio** for the full corpus; credit the reciter in About.
- [ ] **Scholarly review** of the corpus, the enumerations' notes, and all framing copy (the "99" note, the Further Names intro, provenance lines, the About screen statement). This is the gate that must not be skipped.

---

## About screen — required content

The About / Sources screen must (SPEC §9):

- List every enumeration with its full source/attribution and a neutral standing note.
- Credit the translation, reciter, and bundled font (with license).
- State plainly that **Allah's names are not limited to ninety-nine**.
- Include a privacy statement: no analytics, no accounts, all state stays on-device.
