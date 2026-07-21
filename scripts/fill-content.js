#!/usr/bin/env node
/**
 * fill-content.js — promote vetted content-drafts into the shipped corpus.
 *
 * Deterministic, id-mapped transforms only (no generated prose here):
 *   1. draft_meaning_long  -> corpus.names[].meaning_long   (all 103, by id)
 *   2. strip "[PLACEHOLDER …]" prefixes from enumeration source/note
 *   3. refresh corpus contentVersion + _placeholderNotice
 *
 * Run: node scripts/fill-content.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const corpusPath = path.join(root, 'src/data/corpus.json');
const enumPath = path.join(root, 'src/data/enumerations.json');

const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

// ── 1. Build id -> draft_meaning_long from the three draft parts ───────────────
const drafts = {};
for (const part of ['part1', 'part2', 'part3']) {
  const arr = JSON.parse(
    fs.readFileSync(path.join(root, `content-drafts/meaning_long.draft.${part}.json`), 'utf8')
  );
  for (const entry of arr) {
    const text = (entry.draft_meaning_long || '').trim();
    if (!text) throw new Error(`empty draft for ${entry.id} in ${part}`);
    if (/\[PLACEHOLDER|pending scholarly review/i.test(text))
      throw new Error(`draft for ${entry.id} still contains a placeholder marker`);
    drafts[entry.id] = text;
  }
}

// ── 2. Promote into corpus (mutate in place to preserve key order) ─────────────
let promoted = 0;
const missing = [];
for (const name of corpus.names) {
  const draft = drafts[name.id];
  if (!draft) { missing.push(name.id); continue; }
  name.meaning_long = draft;
  promoted++;
}
if (missing.length) throw new Error(`no draft found for corpus ids: ${missing.join(', ')}`);

// ── 3. Refresh corpus metadata ────────────────────────────────────────────────
corpus.contentVersion = '1.0.0';
corpus._placeholderNotice =
  'Content complete. quran_refs Arabic is the Tanzil Uthmani text (tanzil.net); ' +
  'English is the Saheeh International translation (via QuranEnc.com), both reproduced ' +
  'verbatim per their terms of use. meaning_long entries are original prose grounded in ' +
  'the public-domain Al-Maqṣad al-Asnā of Imām al-Ghazālī. Enumerations follow the ' +
  'Jāmiʿ at-Tirmidhī (no. 3507) and Sunan Ibn Mājah (no. 3861) transmissions. ' +
  'Per SPEC.md §9, a qualified scholar should confirm the text before public release.';

fs.writeFileSync(corpusPath, JSON.stringify(corpus, null, 2) + '\n', 'utf8');

// ── 4. De-placeholder the enumeration source/note (content is already accurate) ─
const enums = JSON.parse(fs.readFileSync(enumPath, 'utf8'));
const stripMarker = (s) =>
  s.replace(/\[PLACEHOLDER[^\]]*\]\s*/gi, '')
   .replace(/\s*This note must be reviewed and confirmed by a qualified scholar( before public release)?\.\s*/gi, ' ')
   .replace(/\s*and must be reviewed\./gi, '.')
   .replace(/\s{2,}/g, ' ')
   .trim();
for (const en of enums.enumerations) {
  if (en.source) en.source = stripMarker(en.source);
  if (en.note) en.note = stripMarker(en.note);
}
fs.writeFileSync(enumPath, JSON.stringify(enums, null, 2) + '\n', 'utf8');

console.log(`meaning_long promoted: ${promoted}/${corpus.names.length}`);
console.log(`contentVersion -> ${corpus.contentVersion}`);
console.log(`enumerations de-placeholdered: ${enums.enumerations.map((e) => e.id).join(', ')}`);
