# 99 Beautiful Names — App Specification

*Asmā' al-Ḥusnā — a reverent, offline-first reader for the Beautiful Names of Allah*

---

## 1. Purpose & Guiding Principles

A focused app for reading, listening to, and reflecting on the 99 Beautiful Names. It is a *reader*, not a social or gamified app. Every design decision serves three priorities, in order:

1. **Readability** — Arabic and translation must render beautifully and legibly at any size. Typography is the core of this product, not decoration.
2. **Usability** — A person should reach any name and any layer of detail in one or two taps, and always know where they are and how to get back.
3. **Offline-first** — The complete experience (names, translations, transliterations, recitation audio, core articles) ships *inside* the app and is fully functional in airplane mode. The network is never required; it's touched only for clearly-marked optional extras (external tafsir, sharing). Content changes ship as a new app version (§6).

A secondary, non-negotiable principle:

4. **Authenticity of content** — This is religious material. Text and audio come from vetted sources, are version-controlled, and are not editorialized. See §9.

> **A note on "99."** The Sunnah affirms that Allah has ninety-nine names and attaches a great reward to enumerating them — but the *specific list* of which ninety-nine is largely the work of later narrators and scholars, and reputable enumerations differ in a handful of names. The tradition is also explicit that Allah's names are **not limited to ninety-nine** (the hadith of the names "which You have kept to Yourself in the knowledge of the unseen"). This app is built to honor that: it treats the Names as a *corpus* drawn from several sound enumerations, lets the reader choose which enumeration defines "the 99," and surfaces the remaining names with equal dignity rather than as an afterthought. See §2.

---

## 2. Content Model

The data is organized around three ideas: a single **Name corpus**, several **Enumerations** that each select 99 names from it, and one **active enumeration** chosen by the reader.

### 2.1 The Name corpus

The corpus is the *union* of every name appearing across the reputable enumerations the app ships — so it is somewhat **more than 99** names. Nothing in the corpus is invented or fringe: every entry is attested either in the Quran, in authentic Sunnah, or in a recognized scholarly enumeration, and is tagged with that provenance (§2.3, §9). A name's place is defined by membership in enumerations, not by a single fixed position, so the same corpus serves every enumeration without duplication.

This is treated as **data, not code** — corpus, enumerations, and translations live in bundled source-of-truth files that can be corrected or extended without touching the app.

### 2.2 Enumerations

An *enumeration* is a named, sourced, ordered selection of 99 names from the corpus. Each is its own data object:

| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `tirmidhi`, `ibn_majah`. |
| `title` | string | Display name, e.g. "Tirmidhī enumeration". |
| `source` | string | Full attribution / citation (§9). |
| `note` | markdown | Short, neutral description of the enumeration's basis and standing. |
| `order` | list of 99 name-ids | The ordered selection; defines numbering 1–99 for this enumeration. |

Ship the **Tirmidhī** and **Ibn Mājah** enumerations for v1 (Tirmidhī is the default active list, as the most widely recited). The structure is open-ended — more enumerations are added as data, with no code changes.

### 2.3 Per-name record

Each name in the corpus is one record:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable identifier, referenced by enumerations. |
| `arabic` | string | Fully vowelled (with ḥarakāt). The definitive visual element. |
| `transliteration` | string | Latin transliteration with diacritics (e.g. *Ar-Raḥmān*). Store a plain-ASCII fallback too. |
| `translation` | string | Short English meaning (e.g. "The Most Compassionate"). Keep to one short line. |
| `meaning_long` | markdown | 1–3 paragraph explanation of the name's meaning and significance. **Bundled.** |
| `attestation` | enum/list | Provenance: `quran`, `sunnah`, and/or `enumeration`. Surfaced subtly in the UI; drives the dignity of "other" names (§3). |
| `enumerations` | list | Which enumerations include this name, and its index within each (e.g. `tirmidhi:14`). Derivable from §2.2 `order`, but cached here for fast display. |
| `quran_refs` | list | Verse references where the name appears (sūrah:āyah), with the verse text bundled. |
| `audio` | asset ref | Local file for recitation of the name (§5). |
| `tafsir_links` | list | Optional external links to longer tafsir/articles (§6). Each: label + URL + source name. |
| `root` | string (optional) | Arabic triliteral root, for the linguistically curious. |

The bundled fields are everything needed for a complete offline experience; `tafsir_links` are the only network-dependent content. **Every name in the corpus carries the full set of bundled content** — names outside the active 99 are not second-class and must not look or feel like it.

### 2.4 The active enumeration (config)

A single setting selects the active enumeration (default: the Tirmidhī list, as the most widely recited). The active enumeration determines:

- which 99 names form the primary list and **in what numbered order (1–99)**, and
- which corpus names fall into the "Further Names" view (§3.1) — namely, everything in the corpus *not* in the active enumeration.

Switching the setting never adds or removes content; it only re-partitions the constant corpus between the primary 99 and Further Names. The change is instant and offline.

### 2.5 Storage

Ship the corpus, enumerations, translations, and an `audio/` asset folder as bundled, read-only files. No database server, no remote fetch on launch. Optionally cache user state (last-read name, bookmarks, font size, chosen enumeration) in local device storage only.

---

## 3. Screens & Navigation

Three screens. A strict, shallow hierarchy so the back path is never ambiguous.

```
List  ──tap a name──▶  Detail  ──tap "More"──▶  Reading view
 ▲                       │                          │
 └───────── back ────────┘────────── back ──────────┘
```

### 3.1 List screen (home)

Two clearly-labeled sections in one scrolling view:

- **The 99 (active enumeration)** — the names of the currently selected enumeration, numbered 1–99 in its order. A small, unobtrusive header names the active enumeration (e.g. "Tirmidhī enumeration") and is tappable to change it.
- **Further Names** — the remaining corpus names not in the active enumeration. Introduced by a short, respectful line (e.g. "Other names of Allah affirmed in the Quran and Sunnah, beyond this enumeration of ninety-nine"). These rows are visually identical in quality to the 99 — same typography, same full detail on tap — distinguished only by *not* carrying a 1–99 number, and optionally by a subtle tag showing which enumeration(s) do include them. They are presented as part of the same sacred whole, never as leftovers.

Row anatomy: **Arabic name (large) · transliteration · translation**, with the index number shown only for names in the active 99. The Arabic is the visual anchor of every row.

- Tapping any row — in either section — opens its Detail screen.
- Top bar: app title, a search/jump affordance across the whole corpus, and a settings entry (enumeration, font size, theme, audio).
- Optional: a small inline play button per row for quick listening without leaving the list.
- "Resume" affordance returning to the last name viewed.

### 3.2 Detail screen (one name)

The heart of the app. Generous whitespace, centered, calm.

- **Arabic name**, very large, vowelled, the focal point.
- **Transliteration** directly beneath, smaller.
- **Translation**, smaller still.
- A prominent **play / pause** control for the recitation, with a clear playing state.
- The `meaning_long` text, immediately readable (this is bundled, so it always shows — no spinner).
- A **provenance line** — quiet in styling but fully readable and shown in full on the Detail view (never truncated or hidden behind a tap): where the name is attested (Quran / Sunnah) and which enumerations include it, with its number in each (e.g. "Tirmidhī #14 · Ibn Mājah #16"). For a name outside the active 99 this is what gracefully situates it, with no language implying lesser status.
- Quran references with their verse text inline.
- A **"More"** entry that opens the Reading view (the article + external tafsir links).
- **Previous / Next** controls to move between adjacent names without returning to the list.
- A back control to the list (in addition to the OS/system back).

### 3.3 Reading view (deep content)

- The full article / extended `meaning_long`, formatted for comfortable long-form reading.
- External `tafsir_links` rendered as a clearly-labeled list, each tagged with its **source name** and a small icon indicating it opens externally / requires network. Tapping prompts (or simply opens) the external resource. These are the *only* place the network is used for content.
- Back to Detail.

---

## 4. Navigation & "Back" behavior (explicit requirements)

- Every screen above the list has a **visible in-app back control**, not only the system/gesture back.
- The system back button / swipe must mirror the in-app back exactly: Reading → Detail → List → exit. No traps, no dead ends.
- Previous/Next on Detail moves *within* the same level; it does not deepen the back stack (so pressing back from name 47 returns to the list, not to name 46, 45, 44…). Decide this once and keep it consistent. Traversal order follows the list order (the active 99 first, then Further Names), so Next never strands the reader.
- Audio keeps playing or stops on a predictable rule when navigating (recommendation: continue playing across Detail/Reading, stop when returning to the List). State the rule and honor it everywhere.
- Search/jump returns the person to the chosen name's Detail with the list still behind it.

---

## 5. Recitation Audio

- One audio asset per name, **bundled** with the app (the whole set is small — short clips).
- A single reciter for consistency; credited in Settings/About. **For now, ship placeholder audio** (a temporary recording/cribbed clip) so the feature is wired end-to-end; swap in the licensed, properly-credited reciter before public release. The data model and UI stay identical — only the asset files change.
- Controls: play, pause, and a clear visual playing state. Optional: "play all in sequence" with auto-advance.
- Respect the device silent switch and other-audio (pause music, restore after).
- No streaming, no per-play network request. Audio works fully offline.
- Accessibility: audio is an *enhancement*, never the only way to access a name.

---

## 6. Network Access (deliberately minimal)

The app makes **zero** network calls for its core function and is fully functional with no connection, ever. The network is touched only when:

- The person explicitly taps an external `tafsir_link` in the Reading view.
- The person uses an explicit Share action.

That's the whole list. There is **no in-app content updating** for the MVP: the corpus, enumerations, translations, articles, and audio are all bundled, and **content changes ship as a new app-store build**. This keeps the MVP simple, predictable, and reviewable — corrections go out the same way any other app update does. (A silent in-app refresh can be revisited post-MVP if update cadence ever becomes a pain point.)

Every network-dependent UI element is marked as such and degrades gracefully offline (e.g. external links show "requires connection" rather than failing silently).

---

## 7. Typography, Layout & Theming

This is where "supremely readable" is won or lost.

- **Arabic font:** a high-quality Naskh/Quranic typeface that renders ḥarakāt (vowel marks) correctly and cleanly. This is the single most important asset in the app — choose deliberately and bundle it; do not rely on the system Arabic font.
- **Right-to-left:** Arabic laid out RTL; Latin text LTR. Mixed-direction rows handled correctly.
- **Adjustable text size:** a global control (at least small / medium / large / x-large) that scales everything, and respects the OS dynamic-type / font-scaling setting.
- **Themes:** light, dark, and ideally a warm "sepia/paper" reading theme. High contrast in every theme; verify against accessibility contrast ratios.
- **Enumeration picker:** a Settings control to choose the active enumeration, each option showing its title and a one-line neutral note on its basis. Changing it instantly re-partitions the list (§2.4). Phrase the picker descriptively, never as choosing a "correct" list over a "wrong" one.
- **Transliteration:** shown by default, with a Settings toggle to hide it for readers who prefer Arabic + translation alone. The toggle applies everywhere (list, detail, reading view).
- **Restraint:** generous margins and line spacing, a calm limited palette, no clutter, no ads, no animation that distracts from reading. Whitespace is a feature.

---

## 8. Accessibility

- Full screen-reader support, with correct language tags so Arabic and English are pronounced in the right voice.
- Honors system font-scaling.
- Touch targets comfortably large; controls reachable one-handed.
- Color is never the only signal (playing state, external-link markers use icon + text too).
- Meets WCAG AA contrast in all themes.

---

## 9. Content Sourcing & Integrity (do this before any code)

Because this is sacred material, sourcing is part of the spec, not an afterthought:

- Assemble the **corpus** as the union of names from several vetted enumerations; for **each name**, record its attestation (Quran / Sunnah) and the enumerations that include it. Nothing enters the corpus without a citable basis.
- Document **each enumeration** with its full source/attribution and a neutral note on its scholarly standing. Do not rank enumerations or imply one is the "true" list; present them as the recognized variants they are.
- Have the corpus, enumerations, and especially the framing language (the "99" note, the Further Names intro, any provenance copy) **reviewed by a qualified scholar** before release. The risk here is doctrinal phrasing, not bugs.
- Use a reputable, attributable English translation; credit it in About.
- Recitation audio: confirm rights/permission to bundle, and credit the reciter. Ensure audio exists for *every* corpus name, not only the active 99.
- External tafsir links should point to recognized, reputable resources; record the source name with each.
- Quran verse text and references from a single trusted edition; credit it.
- Keep the data files under version control with a visible content version number, so corrections are traceable.
- An **About / Sources** screen lists every enumeration and its source, the translation, reciter, and font license, and states plainly that Allah's names are not limited to ninety-nine.

---

## 10. Non-Functional Requirements

- **Platform & stack:** **React Native** (iOS + Android from one codebase). Bundle content and audio as app assets; persist user state (chosen enumeration, transliteration toggle, bookmarks, last-read, theme, font size) in on-device storage. Use a small, well-supported audio library for bundled playback and the platform's RTL support for Arabic layout.
- **Performance:** instant launch to the list; opening any name shows bundled content with no loading spinner.
- **Size:** keep the bundle lean; the audio set and Arabic font are the largest assets — compress audio sensibly without degrading clarity.
- **Privacy:** no analytics that phone home, no accounts, no tracking, no network on launch. All stored state stays on-device. State this plainly in About.
- **Resilience:** fully functional in airplane mode; external-link failures never surface an error or break a screen.

---

## 11. Out of Scope (v1)

To protect focus: no accounts/login, no social/sharing feeds, no notifications/streaks/gamification, no quizzes, no in-app purchases, no cloud sync. These can be considered later but are explicitly excluded from the first version.

---

## 12. Decisions & Remaining Items

**Resolved:**

1. **Platform** — React Native (iOS + Android).
2. **Enumerations** — Tirmidhī and Ibn Mājah for v1; Tirmidhī is the default active list. Corpus = union of the two; structure is open to more later.
3. **Audio** — placeholder recordings for now, wired exactly as the final assets will be; licensed, credited reciter swapped in before public release.
4. **Provenance** — a quiet but fully-readable line, shown in full on the Detail view.
5. **Transliteration** — on by default, with a global hide/show toggle.
6. **Content updates** — none in-app for MVP; content is bundled and changes ship as a new app-store build (§6).

**Still to confirm before release:**

- The **final translation** to standardize on, and the **Quran edition** for verse text.
- The **licensed reciter** and rights to bundle the full corpus audio.
- **Scholarly review** of the corpus, the enumerations' notes, and all framing copy (§9) — the one gate that should not be skipped.
