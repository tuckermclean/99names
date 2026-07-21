/**
 * Data integrity guards for the bundled corpus + enumerations.
 * These lock in invariants the app's selectors depend on, and — for the
 * quran_refs check — lock in the verse-text import (no leftover placeholders).
 */

import corpusRaw from './corpus.json';
import enumerationsRaw from './enumerations.json';
import type { CorpusName, Enumeration } from './types';

const names = corpusRaw.names as CorpusName[];
const enumerations = enumerationsRaw.enumerations as Enumeration[];
const corpusIds = new Set(names.map((n) => n.id));

describe('corpus.json', () => {
  it('has a contentVersion string', () => {
    expect(typeof corpusRaw.contentVersion).toBe('string');
    expect(corpusRaw.contentVersion.length).toBeGreaterThan(0);
  });

  it('has no duplicate name ids', () => {
    const ids = names.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every quran_refs entry has non-empty, non-placeholder text_ar and text_en', () => {
    const offenders: string[] = [];
    for (const name of names) {
      for (const ref of name.quran_refs ?? []) {
        const arOk =
          typeof ref.text_ar === 'string' &&
          ref.text_ar.trim().length > 0 &&
          !ref.text_ar.includes('[PLACEHOLDER');
        const enOk =
          typeof ref.text_en === 'string' &&
          ref.text_en.trim().length > 0 &&
          !ref.text_en.includes('[PLACEHOLDER');
        if (!arOk || !enOk) {
          offenders.push(`${name.id} (sura ${ref.sura}, ayah ${ref.ayah})`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has at least one name carrying a quran_ref (sanity check the field is populated)', () => {
    const withRefs = names.filter((n) => (n.quran_refs ?? []).length > 0);
    expect(withRefs.length).toBeGreaterThan(0);
  });
});

describe('enumerations.json', () => {
  it('has a contentVersion string', () => {
    expect(typeof enumerationsRaw.contentVersion).toBe('string');
    expect(enumerationsRaw.contentVersion.length).toBeGreaterThan(0);
  });

  it('has a default enumeration id that resolves to a real enumeration', () => {
    expect(
      enumerations.some((e) => e.id === enumerationsRaw.default),
    ).toBe(true);
  });

  it.each(enumerations.map((e) => [e.id, e] as const))(
    'enumeration "%s" has exactly 99 ids with no duplicates',
    (_id, enumeration) => {
      expect(enumeration.order).toHaveLength(99);
      expect(new Set(enumeration.order).size).toBe(enumeration.order.length);
    },
  );

  it.each(enumerations.map((e) => [e.id, e] as const))(
    'every id in enumeration "%s" order[] exists in the corpus',
    (_id, enumeration) => {
      const missing = enumeration.order.filter((id) => !corpusIds.has(id));
      expect(missing).toEqual([]);
    },
  );
});
