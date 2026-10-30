"use client";

/* ==========================================================================
   ALRS · Header — sticky brand bar, nav, ⌘K trigger, auth button
   ========================================================================== */

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useContent, useUI } from "./ui/ui-context";
import { useStore } from "@/lib/store";
import { BrandMark } from "@/lib/brand";
import { ROUTE_PATH } from "@/lib/data";
import { ico } from "@/lib/icons";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const content = useContent();
  const { openCmd, openSignIn, drawerOpen, closeDrawer, openDrawer } = useUI();
  const store = useStore();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      document
        .getElementById("siteHeader")
        ?.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const member = store.member;

  return (
    <header className="site-header" id="siteHeader">
      <div className="container header__inner">
        <Link className="brand" href="/">
          <span className="brand__mark">
            <BrandMark logo={content.uploads.logo} />
          </span>
          <span className="brand__text">
            <strong>ALRS</strong>
            <small>Red Spartans Esports</small>
          </span>
        </Link>

        <nav className="mainnav" aria-label="Primary">
          {content.nav.map((n) => (
            <Link
              key={n.id}
              href={ROUTE_PATH[n.id]}
              className={pathname === ROUTE_PATH[n.id] ? "is-active" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <ThemeToggle />
          <button
            className="icon-btn"
            id="cmdTrigger"
            title="Search & navigate (Ctrl/⌘ + K)"
            aria-label="Open command palette"
            onClick={openCmd}
          >
            {ico("search", 16)}
            <span className="mono kbd">⌘K</span>
          </button>
          {member ? (
            <Link className="btn btn--sm btn--solid" href="/dashboard">
              {`${member.name.split(" ")[0]} · ID`}
            </Link>
          ) : (
            <button
              className="btn btn--sm btn--ghost"
              type="button"
              onClick={openSignIn}
            >
              Sign in
            </button>
          )}
          <Link className="btn btn--primary btn--sm" href="/membership">
            Join ALRS
          </Link>
          <button
            className="burger"
            aria-label="Menu"
            aria-expanded={drawerOpen}
            onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </div>
      <div className="header__scan" />
    </header>
  );
}
