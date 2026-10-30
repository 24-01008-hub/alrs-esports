"use client";

/* ==========================================================================
   ALRS · ui-context.ts — shared client contexts (content + shell UI)
   Split from Providers.tsx so modal components can import the hooks
   without an import cycle.
   ========================================================================== */

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { SiteContent } from "@/lib/types";

export interface UIApi {
  toast(title: string, msg?: string, kind?: "ok" | "gold" | "warn"): void;
  openModal(node: ReactNode, opts?: { size?: "sm"; label?: string }): void;
  closeModal(): void;
  openEnroll(tierId?: string): void;
  openSignIn(): void;
  openRedeem(sponsorId: string): void;
  cmdOpen: boolean;
  openCmd(): void;
  closeCmd(): void;
  drawerOpen: boolean;
  openDrawer(): void;
  closeDrawer(): void;
}

export const ContentContext = createContext<SiteContent | null>(null);
export const UIContext = createContext<UIApi | null>(null);

export function useContent(): SiteContent {
  const c = useContext(ContentContext);
  if (!c) throw new Error("useContent must be used inside <Providers>");
  return c;
}

export function useUI(): UIApi {
  const u = useContext(UIContext);
  if (!u) throw new Error("useUI must be used inside <Providers>");
  return u;
}
