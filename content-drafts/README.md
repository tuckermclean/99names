# content-drafts/ — UNREVIEWED, AI-drafted content scaffolds

**These files are not authoritative and are not part of the shipped app.**

Everything in this directory is a **draft scaffold** produced by an AI agent as a
*starting point* for the mandatory scholarly review required by **SPEC.md §9**
("Content Sourcing & Integrity"). Each `meaning_long.draft.part*.json` file contains
original, AI-written prose that paraphrases themes from Imām al-Ghazālī's
public-domain *Al-Maqṣad al-Asnā fī Sharḥ Asmāʾ Allāh al-Ḥusnā*, along with a
`ghazali_basis` note that states the drafting agent's confidence and flags any gaps
or uncertainty in coverage.

## What this is

- A rough first pass intended to give a qualified scholar something to react to,
  correct, and rewrite — not a finished or vetted text.
- Grounded in one classical source (al-Ghazālī) only. It does not represent the
  full range of tafsīr, ḥadīth commentary, or scholarly consensus that the final
  `meaning_long` text should draw on per SPEC.md §9.
- Marked per-entry with `"status": "UNREVIEWED_DRAFT"`.

## What this is NOT

- **Not authoritative.** No qualified scholar has reviewed, corrected, or approved
  any text in this directory.
- **Not final content.** Prose, emphasis, and theological framing may be incomplete,
  imprecise, or simply wrong in places the drafting agent could not detect.
- **Not to be copied into `src/data/corpus.json`'s `meaning_long` fields** under any
  circumstances until a qualified scholar has reviewed and rewritten it.
- **Not shipped.** This directory is excluded from the app bundle and must stay
  outside `src/` for exactly that reason.

## Required next step

Per SPEC.md §9, the corpus and all framing language must be "reviewed by a
qualified scholar before release." That review — not this scaffold — is the
gate that makes any of this content fit to appear in the app.
