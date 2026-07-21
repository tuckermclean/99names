// ─── Content model types (mirrors SPEC.md §2) ────────────────────────────────

export type AttestationType = 'quran' | 'sunnah' | 'enumeration';

export interface QuranRef {
  sura: number;
  ayah: number;
  /** Fully-vowelled Arabic verse text (Tanzil Uthmani, tanzil.net) */
  text_ar: string;
  /** English verse text (Saheeh International, via QuranEnc.com) */
  text_en: string;
}

export interface TafsirLink {
  label: string;
  url: string;
  source_name: string;
}

export interface EnumerationMembership {
  enumId: string;
  /** 1-based index within that enumeration */
  index: number;
}

export interface CorpusName {
  /** Stable kebab-case identifier referenced by enumerations */
  id: string;
  /** Fully vowelled (with ḥarakāt) Arabic text */
  arabic: string;
  /** Latin transliteration with diacritics */
  transliteration: string;
  /** Plain ASCII fallback transliteration */
  transliteration_ascii: string;
  /** Short English meaning (≤ one line) */
  translation: string;
  /** 1–3 paragraph explanation (original prose grounded in al-Ghazālī's Al-Maqṣad al-Asnā) */
  meaning_long: string;
  attestation: AttestationType[];
  quran_refs: QuranRef[];
  /** Filename within src/assets/audio/ (placeholder clip for now) */
  audio: string;
  tafsir_links: TafsirLink[];
  /** Optional Arabic triliteral root */
  root?: string;
  /**
   * Cached enumeration memberships (derived from enumerations.json).
   * Populated by access.ts at load time — not stored in the JSON.
   */
  enumerations?: EnumerationMembership[];
}

export interface Enumeration {
  id: string;
  title: string;
  /** Full source attribution / citation */
  source: string;
  /** Neutral scholarly standing note (markdown) */
  note: string;
  /** Ordered list of 99 corpus name IDs */
  order: string[];
}

export interface CorpusData {
  contentVersion: string;
  _placeholderNotice: string;
  names: CorpusName[];
}

export interface EnumerationsData {
  contentVersion: string;
  /** Default active enumeration id */
  default: string;
  enumerations: Enumeration[];
}

// ─── Settings types ───────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'sepia';
export type FontScale = 'small' | 'medium' | 'large' | 'xlarge';

export interface AudioPrefs {
  autoplay: boolean;
  playAllSequence: boolean;
}

export interface Settings {
  activeEnumeration: string;
  theme: Theme;
  fontScale: FontScale;
  showTransliteration: boolean;
  audioPrefs: AudioPrefs;
  bookmarks: string[];
  lastReadNameId: string | null;
}
