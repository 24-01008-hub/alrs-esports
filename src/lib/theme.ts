/* ==========================================================================
   ALRS · theme.ts — dual-theme plumbing (onyx default · ivory optional)
   ========================================================================== */

export type ThemeName = "onyx" | "ivory";

export const THEME_KEY = "alrs.theme";
export const DEFAULT_THEME: ThemeName = "onyx";

/** Blocking snippet injected before body content so the saved theme is on
 *  <html> before first paint (no flash of the wrong theme). */
export const THEME_INIT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="ivory"&&t!=="onyx"){t="${DEFAULT_THEME}";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","${DEFAULT_THEME}");}})();`;
