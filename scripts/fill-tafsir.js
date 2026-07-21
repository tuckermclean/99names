#!/usr/bin/env node
/**
 * fill-tafsir.js — populate corpus tafsir_links deterministically (idempotent).
 *
 *   - Qurʾān-attested names  -> one Quran.com verse link per quran_ref
 *                               (https://quran.com/{sura}:{ayah}, verified HTTP 200;
 *                                the verse page exposes per-verse tafsīr).
 *   - Ḥadīth-only names (26) -> the ḥadīth of the ninety-nine names on Sunnah.com
 *                               (their actual attestation; sunnah.com blocks bots
 *                                so it can't be curl-verified, but the URN scheme is
 *                                canonical and resolves in a device browser).
 *
 * Run: node scripts/fill-tafsir.js
 */
const fs = require('fs');
const path = require('path');

const corpusPath = path.join(__dirname, '..', 'src/data/corpus.json');
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

const HADITH_LINK = {
  label: 'The ḥadīth of the ninety-nine names',
  url: 'https://sunnah.com/tirmidhi:3507',
  source_name: 'Sunnah.com — Jāmiʿ at-Tirmidhī 3507',
};

let quranNames = 0;
let hadithNames = 0;
let totalLinks = 0;

for (const name of corpus.names) {
  const refs = name.quran_refs ?? [];
  if (refs.length > 0) {
    const seen = new Set();
    const links = [];
    for (const ref of refs) {
      const key = `${ref.sura}:${ref.ayah}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        label: `Qurʾān ${ref.sura}:${ref.ayah} — translations & tafsīr`,
        url: `https://quran.com/${ref.sura}:${ref.ayah}`,
        source_name: 'Quran.com',
      });
    }
    name.tafsir_links = links;
    quranNames++;
    totalLinks += links.length;
  } else {
    name.tafsir_links = [{ ...HADITH_LINK }];
    hadithNames++;
    totalLinks += 1;
  }
}

fs.writeFileSync(corpusPath, JSON.stringify(corpus, null, 2) + '\n', 'utf8');

const empty = corpus.names.filter((n) => (n.tafsir_links ?? []).length === 0).length;
console.log(`quran-attested names linked: ${quranNames}`);
console.log(`hadith-only names linked:    ${hadithNames}`);
console.log(`total tafsir_links written:  ${totalLinks}`);
console.log(`names still with 0 links:    ${empty}`);
