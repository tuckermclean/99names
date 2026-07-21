/**
 * Tests for the pure data-access selectors in access.ts.
 * Asserts against the real bundled corpus.json / enumerations.json content.
 */

import corpusRaw from './corpus.json';
import enumerationsRaw from './enumerations.json';
import {
  getActiveList,
  getAllEnumerations,
  getAllNames,
  getEnumerationById,
  getEnumerationMembership,
  getFurtherNames,
  getIndexInEnumeration,
  getNextName,
  getPrevName,
  getTraversalOrder,
  DEFAULT_ENUMERATION_ID,
  CONTENT_VERSION,
} from './access';

const ENUM_IDS = enumerationsRaw.enumerations.map((e) => e.id);
const CORPUS_SIZE = corpusRaw.names.length;

describe('getActiveList', () => {
  it.each(ENUM_IDS)('returns exactly 99 names for "%s"', (enumId) => {
    const list = getActiveList(enumId);
    expect(list).toHaveLength(99);
  });

  it('returns names in the exact order given by the enumeration', () => {
    const enumeration = getEnumerationById('tirmidhi')!;
    const list = getActiveList('tirmidhi');
    expect(list.map((n) => n.id)).toEqual(enumeration.order);
  });

  it('returns an empty array for an unknown enumeration id', () => {
    expect(getActiveList('does-not-exist')).toEqual([]);
  });
});

describe('getFurtherNames', () => {
  it.each(ENUM_IDS)(
    'returns the corpus minus the active 99 for "%s"',
    (enumId) => {
      const active = getActiveList(enumId);
      const further = getFurtherNames(enumId);
      expect(further).toHaveLength(CORPUS_SIZE - active.length);

      const activeIds = new Set(active.map((n) => n.id));
      for (const name of further) {
        expect(activeIds.has(name.id)).toBe(false);
      }
    },
  );

  it('is sorted alphabetically by transliteration_ascii', () => {
    const further = getFurtherNames('tirmidhi');
    const sorted = [...further].sort((a, b) =>
      a.transliteration_ascii.localeCompare(b.transliteration_ascii),
    );
    expect(further.map((n) => n.id)).toEqual(sorted.map((n) => n.id));
  });

  it('returns the whole corpus for an unknown enumeration id', () => {
    expect(getFurtherNames('does-not-exist')).toHaveLength(CORPUS_SIZE);
  });
});

describe('getTraversalOrder', () => {
  it.each(ENUM_IDS)(
    'has length equal to the full corpus size for "%s"',
    (enumId) => {
      expect(getTraversalOrder(enumId)).toHaveLength(CORPUS_SIZE);
    },
  );

  it('places the active 99 first, then Further Names', () => {
    const order = getTraversalOrder('tirmidhi');
    const active = getActiveList('tirmidhi');
    const further = getFurtherNames('tirmidhi');
    expect(order.slice(0, 99).map((n) => n.id)).toEqual(
      active.map((n) => n.id),
    );
    expect(order.slice(99).map((n) => n.id)).toEqual(
      further.map((n) => n.id),
    );
  });

  it('contains no duplicate ids', () => {
    const order = getTraversalOrder('tirmidhi');
    const ids = order.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getPrevName / getNextName', () => {
  const enumId = 'tirmidhi';

  it('returns the correct neighbors for a name in the middle of the traversal order', () => {
    const order = getTraversalOrder(enumId);
    const midIdx = Math.floor(order.length / 2);
    const mid = order[midIdx];

    expect(getPrevName(mid.id, enumId)?.id).toBe(order[midIdx - 1].id);
    expect(getNextName(mid.id, enumId)?.id).toBe(order[midIdx + 1].id);
  });

  it('returns null for getPrevName at the start of the traversal order', () => {
    const order = getTraversalOrder(enumId);
    expect(getPrevName(order[0].id, enumId)).toBeNull();
  });

  it('returns null for getNextName at the end of the traversal order', () => {
    const order = getTraversalOrder(enumId);
    expect(getNextName(order[order.length - 1].id, enumId)).toBeNull();
  });

  it('returns null for an id not present in the traversal order', () => {
    expect(getPrevName('not-a-real-id', enumId)).toBeNull();
    expect(getNextName('not-a-real-id', enumId)).toBeNull();
  });
});

describe('getIndexInEnumeration', () => {
  it('returns the correct 1-based index for a name known to be in the enumeration', () => {
    const enumeration = getEnumerationById('tirmidhi')!;
    const firstId = enumeration.order[0];
    const lastId = enumeration.order[enumeration.order.length - 1];

    expect(getIndexInEnumeration(firstId, 'tirmidhi')).toBe(1);
    expect(getIndexInEnumeration(lastId, 'tirmidhi')).toBe(99);
  });

  it('returns null for a name not in the enumeration', () => {
    const further = getFurtherNames('tirmidhi');
    expect(further.length).toBeGreaterThan(0);
    expect(getIndexInEnumeration(further[0].id, 'tirmidhi')).toBeNull();
  });

  it('returns null for an unknown enumeration id', () => {
    const anyId = getAllNames()[0].id;
    expect(getIndexInEnumeration(anyId, 'does-not-exist')).toBeNull();
  });
});

describe('getEnumerationMembership', () => {
  it('reports membership + 1-based index for a name in multiple enumerations', () => {
    const tirmidhiOrder = getEnumerationById('tirmidhi')!.order;
    const ibnMajahOrder = getEnumerationById('ibn_majah')!.order;
    const sharedId = tirmidhiOrder.find((id) => ibnMajahOrder.includes(id));
    expect(sharedId).toBeDefined();

    const membership = getEnumerationMembership(sharedId!);
    const enumIds = membership.map((m) => m.enumId).sort();
    expect(enumIds).toEqual(['ibn_majah', 'tirmidhi']);

    const tirmidhiMembership = membership.find(
      (m) => m.enumId === 'tirmidhi',
    )!;
    expect(tirmidhiMembership.index).toBe(
      tirmidhiOrder.indexOf(sharedId!) + 1,
    );
  });

  it('returns an empty array for a name in neither enumeration (if one exists) or a bogus id', () => {
    expect(getEnumerationMembership('not-a-real-id')).toEqual([]);
  });
});

describe('getAllNames / getAllEnumerations / defaults', () => {
  it('returns the full corpus from getAllNames', () => {
    expect(getAllNames()).toHaveLength(CORPUS_SIZE);
  });

  it('returns all enumerations from getAllEnumerations', () => {
    expect(getAllEnumerations().map((e) => e.id).sort()).toEqual(
      [...ENUM_IDS].sort(),
    );
  });

  it('exposes the default enumeration id from the JSON', () => {
    expect(DEFAULT_ENUMERATION_ID).toBe(enumerationsRaw.default);
  });

  it('exposes the content version from the JSON', () => {
    expect(CONTENT_VERSION).toBe(corpusRaw.contentVersion);
  });
});
