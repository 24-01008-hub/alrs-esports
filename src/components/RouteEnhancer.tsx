"use client";

/* ==========================================================================
   ALRS · RouteEnhancer — re-runs reveal/counters/tilt/holo after each
   client-side navigation (the "enhance" pass of legacy js/app.js)
   ========================================================================== */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { afterHydration, enhance } from "@/lib/effects";

export default function RouteEnhancer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.getElementById("view");
    if (!root) return;
    // Defer until React hydration settles: `#view` and its `.reveal` children
    // are React-owned, so mutating them pre-hydration warns about a mismatch.
    return afterHydration(() => {
      root.classList.remove("view-enter");
      void root.offsetWidth; // restart the enter animation
      root.classList.add("view-enter");
      return enhance(root);
    });
  }, [pathname]);

  return null;
}
