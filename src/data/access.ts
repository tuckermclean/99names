/**
 * Pure data-access layer — no React, no side effects.
 * Loaded once at module-import time; all functions are synchronous.
 * SPEC §2, STRUCTURE §4
 */

import type {
  CorpusName,
  Enumeration,
  EnumerationMembership,
} from './types';

// ─── Module-level singletons ──────────────────────────────────────────────────

import corpusRaw from './corpus.json';
import enumerationsRaw from './enumerations.json';

// Build a lookup map: nameId → name record (with enumerations cached in)
const _nameMap = new Map<string, CorpusName>();
const _enumerationMap = new Map<string, Enumeration>();

// Populate enumeration map
for (const e of enumerationsRaw.enumerations as Enumeration[]) {
  _enumerationMap.set(e.id, e);
}

// Populate name map and inject cached enumeration membership
for (const name of corpusRaw.names as CorpusName[]) {
  const memberships: EnumerationMembership[] = [];
  for (const [enumId, e] of _enumerationMap.entries()) {
    const idx = e.order.indexOf(name.id);
    if (idx !== -1) {
      memberships.push({ enumId, index: idx + 1 }); // 1-based
    }
  }
  _nameMap.set(name.id, { ...name, enumerations: memberships });
}

// ─── Public selectors ─────────────────────────────────────────────────────────

/**
 * All corpus names (no particular order).
 */
export function getAllNames(): CorpusName[] {
  return Array.from(_nameMap.values());
}

/**
 * Single name by id. Returns undefined if id is not in the corpus.
 */
export function getNameById(id: string): CorpusName | undefined {
  return _nameMap.get(id);
}

/**
 * Ordered list of 99 names for the given enumeration.
 * Order follows the enumeration's `order` array (1-indexed).
 */
export function getActiveList(enumId: string): CorpusName[] {
  const e = _enumerationMap.get(enumId);
  if (!e) return [];
  return e.order.map((id) => _nameMap.get(id)!).filter(Boolean);
}

/**
 * Corpus names NOT in the given enumeration — the "Further Names" section.
 * Sorted alphabetically by transliteration_ascii for a stable display order.
 */
export function getFurtherNames(enumId: string): CorpusName[] {
  const e = _enumerationMap.get(enumId);
  if (!e) return Array.from(_nameMap.values());
  const inEnum = new Set(e.order);
  return Array.from(_nameMap.values())
    .filter((n) => !inEnum.has(n.id))
    .sort((a, b) =>
      a.transliteration_ascii.localeCompare(b.transliteration_ascii),
    );
}

/**
 * Full traversal order for Prev/Next on NameDetail:
 * active enumeration's 99 first, then Further Names (alphabetical).
 * SPEC §4, STRUCTURE §1
 */
export function getTraversalOrder(enumId: string): CorpusName[] {
  return [...getActiveList(enumId), ...getFurtherNames(enumId)];
}

/**
 * Which enumerations include a given name, and at what 1-based index.
 * Used by ProvenanceLine. Returns [] if name is in neither list.
 */
export function getEnumerationMembership(
  nameId: string,
): EnumerationMembership[] {
  return _nameMap.get(nameId)?.enumerations ?? [];
}

/**
 * All available enumerations.
 */
export function getAllEnumerations(): Enumeration[] {
  return Array.from(_enumerationMap.values());
}

/**
 * A single enumeration by id.
 */
export function getEnumerationById(id: string): Enumeration | undefined {
  return _enumerationMap.get(id);
}

/**
 * Default active enumeration id (from the JSON's `default` field).
 */
export const DEFAULT_ENUMERATION_ID: string = enumerationsRaw.default;

/**
 * Content version of the corpus (for debugging / About screen).
 */
export const CONTENT_VERSION: string = corpusRaw.contentVersion;

/**
 * Given a nameId and an enumeration, return its 1-based index or null.
 */
export function getIndexInEnumeration(
  nameId: string,
  enumId: string,
): number | null {
  const e = _enumerationMap.get(enumId);
  if (!e) return null;
  const idx = e.order.indexOf(nameId);
  return idx === -1 ? null : idx + 1;
}

/**
 * Previous name in traversal order, or null if at start.
 */
export function getPrevName(
  nameId: string,
  enumId: string,
): CorpusName | null {
  const order = getTraversalOrder(enumId);
  const idx = order.findIndex((n) => n.id === nameId);
  return idx > 0 ? order[idx - 1] : null;
}

/**
 * Next name in traversal order, or null if at end.
 */
export function getNextName(
  nameId: string,
  enumId: string,
): CorpusName | null {
  const order = getTraversalOrder(enumId);
  const idx = order.findIndex((n) => n.id === nameId);
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
}
