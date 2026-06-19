/**
 * Font family constants. Arabic uses the bundled Amiri Naskh face;
 * Latin body uses the system font stack. SPEC §7, STRUCTURE §6.
 *
 * Do NOT call I18nManager.forceRTL — render Arabic RTL at the text level
 * only, via writingDirection + textAlign. AGENTS.md hard rule.
 */

export const FontFamily = {
  arabic: 'Amiri-Regular',
  arabicBold: 'Amiri-Bold',
  /** System sans-serif for Latin UI chrome */
  system: undefined, // undefined → React Native picks the platform default
} as const;

/**
 * Style preset for Arabic text that renders correctly RTL with ḥarakāt.
 * Pass fontSize from the type scale; do not hard-code it here.
 */
export function arabicTextStyle(fontSize: number): object {
  return {
    fontFamily: FontFamily.arabic,
    fontSize,
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: fontSize * 1.65,  // generous: ḥarakāt need vertical breathing room
  };
}

/**
 * Style preset for bold Arabic text.
 */
export function arabicBoldStyle(fontSize: number): object {
  return {
    ...arabicTextStyle(fontSize),
    fontFamily: FontFamily.arabicBold,
  };
}

/**
 * Style preset for Latin body / UI text.
 */
export function bodyTextStyle(fontSize: number): object {
  return {
    fontFamily: FontFamily.system,
    fontSize,
    lineHeight: fontSize * 1.55,
  };
}
