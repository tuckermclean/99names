# Audio placeholders — development only, NOT for distribution

**Status:** These per-name recitation clips are temporary development
placeholders. They are **unlicensed** and their reciter is **unknown /
unattributed**. They exist purely to give the dev team a realistic feel for
per-name audio playback while building the app. They **must be replaced**
with properly licensed, credited reciter audio before any public release or
distribution, per SPEC.md §5's placeholder-swap plan.

## Source

- Repository: https://github.com/ProgrammerHasan/99-names-of-allah-audios
- Files fetched from the `main` branch via the GitHub API / raw.githubusercontent.com,
  commit state as of 2026-07-21.
- The repo ships no `LICENSE` file and no reciter credit in its README or
  commit history — hence "unlicensed" / "reciter unknown" above. Do not
  ship these files to end users or app stores.
- Format: MP3 (as downloaded, unmodified/re-encoded).
- Total added size: ~1.8 MB across 99 files.

## How ids were matched to clips

The source repo numbers its files 1–99 following the traditional list of the
99 names (i.e. excluding "Allah" itself, which is the Supreme Name rather
than one of the 99). Most filenames already carried a name slug matching this
project's corpus ids directly. A few source filenames had typos or
duplicated slugs relative to their position in the traditional list; those
were matched by cross-checking against `src/data/corpus.json`'s
`transliteration_ascii` field rather than trusting the filename alone:

| Source file | Mapped corpus id | Note |
|---|---|---|
| `audio49_49_al_bayes.mp3` | `al_baith` | source filename typo ("al_bayes") for Al-Ba'ith |
| `audio65_65_al_majid.mp3` | `al_majd` | corpus's `al_majd` entry also transliterates "Al-Majid"; source's `al_majid` slug is reused/duplicated at this position |
| `audio67_67_al_ahad.mp3` | `al_ahad` | bonus match — this is one of the 4 "Further Names" in the corpus, not one of the standard 99, but the source repo's numbering happened to include it |
| `audio77_77_al_wali.mp3` | `al_wali_gov` | corpus's second "Al-Wali" entry (The Governing Protector variant) |
| `audio84_84_malik_ul_mulk.mp3` | `malik_al_mulk` | spelling variant ("ul" vs "al") |
| `audio85_85_dhul_jalaal_wal_ikraam.mp3` | `dhul_jalal` | longer transliteration variant of the same name |
| `audio87_87_al_jame.mp3` | `al_jami` | spelling variant ("jame" vs "jami") |

All other files mapped 1:1 by matching corpus id / transliteration.

## Coverage: 99 of 103 corpus ids got a real clip

**Fallback to `placeholder.wav` (4 ids, no clip found):**
- `allah` — the Supreme Name itself is not one of the 99 names; no separate
  clip exists in the source repo.
- `al_qarib`, `ar_rabb`, `al_fatir` — 3 of the corpus's 4 "Further Names"
  (beyond the traditional 99); the source repo doesn't cover these.

**Real (unlicensed, dev-only) clip wired in (99 ids):** every other id in
`src/data/corpus.json`, including `al_ahad` (a Further Name that happened to
be covered — see table above). See `src/audio/audioManifest.ts` for the
exact per-id mapping.

## Getting the clips locally

This repository is public, so these 99 unlicensed MP3 files are **not
committed** — `.gitignore` excludes `src/assets/audio/*.mp3` (with an
exception keeping `placeholder.wav` tracked, since that one's an
intentionally-blank in-repo asset). After cloning, run:

```
npm run fetch-audio
```

This re-downloads the clips from the source repo into `src/assets/audio/`
using the id-to-source-filename mapping in `scripts/fetch-audio.mjs` (the
same mapping documented in the table above). The script skips any file
that's already present, so it's safe to re-run.

## Before release

- Replace every `require('../assets/audio/<id>.mp3')` entry in
  `src/audio/audioManifest.ts` with a licensed, credited reciter clip (or an
  approved silent/placeholder asset if a given name is intentionally
  unvoiced).
- Remove these 99 MP3 files and this notice once replaced.
- Confirm bundling rights with the reciter/publisher before shipping any
  replacement audio.
