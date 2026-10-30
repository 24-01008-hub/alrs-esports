"use client";

/* ==========================================================================
   ALRS · Drawer — mobile navigation panel
   ========================================================================== */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContent, useUI } from "./ui/ui-context";
import { ROUTE_PATH } from "@/lib/data";

export default function Drawer() {
  const content = useContent();
  const { drawerOpen, closeDrawer } = useUI();
  const pathname = usePathname();

  return (
    <div className={`drawer ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen}>
      <div className="drawer__panel">
        <div className="drawer__head">
          <span className="mono">NAVIGATE</span>
          <button className="icon-btn" onClick={closeDrawer} aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav className="drawer__nav" aria-label="Mobile">
          {content.nav.map((n, i) => (
            <Link
              key={n.id}
              href={ROUTE_PATH[n.id]}
              className={pathname === ROUTE_PATH[n.id] ? "is-active" : undefined}
              onClick={closeDrawer}
            >
              {n.label}
              <span>
                0{i + 1} · {n.hint}
              </span>
            </Link>
          ))}
        </nav>
        <div className="drawer__foot">
          <Link className="btn btn--primary btn--block" href="/membership" onClick={closeDrawer}>
            Become a Spartan
          </Link>
          <p className="mono muted">BatStateU · Alangilan Campus · Batangas</p>
        </div>
      </div>
      <div className="drawer__scrim" onClick={closeDrawer} />
    </div>
  );
}
