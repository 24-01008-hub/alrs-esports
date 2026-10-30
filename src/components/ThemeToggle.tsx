"use client";

/* ==========================================================================
   ALRS · ThemeToggle — flips between the Onyx and Ivory themes
   ========================================================================== */

import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_KEY, type ThemeName } from "@/lib/theme";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "ivory" || current === "onyx") setTheme(current);
  }, []);

  const toggle = () => {
    const next: ThemeName = theme === "ivory" ? "onyx" : "ivory";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode — theme still applies for this session */
    }
  };

  return (
    <button
      className="icon-btn theme-toggle"
      type="button"
      title={theme === "ivory" ? "Switch to Onyx theme" : "Switch to Ivory theme"}
      aria-label="Toggle colour theme"
      aria-pressed={theme === "ivory"}
      onClick={toggle}
    >
      {theme === "ivory" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
