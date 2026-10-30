"use client";

/* ==========================================================================
   ALRS · Providers.tsx — client shell: content + UI context,
   toast queue, modal host, global keyboard shortcuts, custom-logo vars.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ContentContext, UIContext, type UIApi } from "./ui-context";
import type { SiteContent } from "@/lib/types";
import EnrollWizard from "@/components/modals/EnrollWizard";
import SignInModal from "@/components/modals/SignInModal";
import RedeemModal from "@/components/modals/RedeemModal";

interface ModalState {
  node: ReactNode;
  size?: "sm";
  label?: string;
}

interface ToastItem {
  id: number;
  title: string;
  msg: string;
  kind?: "ok" | "gold" | "warn";
  out?: boolean;
}

const GLYPH: Record<string, string> = { ok: "✓", gold: "★", warn: "!" };

export default function Providers({
  content,
  children,
}: {
  content: SiteContent;
  children: ReactNode;
}) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  /* ------------------------------------------------------------- toasts */
  const toast = useCallback((title: string, msg = "", kind?: "ok" | "gold" | "warn") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, msg, kind }]);
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x)));
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 320);
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) =>
      t.flatMap((x) =>
        x.id === id
          ? x.out
            ? []
            : [{ ...x, out: true }]
          : [x],
      ),
    );
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 320);
  }, []);

  /* -------------------------------------------------------------- modal */
  const openModal = useCallback((node: ReactNode, opts?: { size?: "sm"; label?: string }) => {
    lastFocus.current = (document.activeElement as HTMLElement) ?? null;
    setModal({ node, size: opts?.size, label: opts?.label });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    const el = lastFocus.current;
    if (el && typeof el.focus === "function") {
      try {
        el.focus();
      } catch {
        /* element may be gone */
      }
    }
    lastFocus.current = null;
  }, []);

  const openEnroll = useCallback(
    (tierId?: string) => {
      lastFocus.current = (document.activeElement as HTMLElement) ?? null;
      setModal({
        node: <EnrollWizard initialTier={tierId} />,
        label: "Membership enrolment",
      });
    },
    [],
  );

  const openSignIn = useCallback(() => {
    lastFocus.current = (document.activeElement as HTMLElement) ?? null;
    setModal({
      node: <SignInModal />,
      label: "Spartan sign in",
    });
  }, []);

  const openRedeem = useCallback((sponsorId: string) => {
    lastFocus.current = (document.activeElement as HTMLElement) ?? null;
    setModal({
      node: <RedeemModal sponsorId={sponsorId} />,
      size: "sm",
      label: "Redeem reward",
    });
  }, []);

  /* ------------------------------------------------------- shell wiring */
  const api: UIApi = {
    toast,
    openModal,
    closeModal,
    openEnroll,
    openSignIn,
    openRedeem,
    cmdOpen,
    openCmd: () => setCmdOpen(true),
    closeCmd: () => setCmdOpen(false),
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  /* body scroll lock while any overlay is open */
  useEffect(() => {
    document.body.classList.toggle("no-scroll", !!(modal || cmdOpen || drawerOpen));
  }, [modal, cmdOpen, drawerOpen]);

  /* focus first control when a modal opens */
  useEffect(() => {
    if (!modal) return;
    const t = setTimeout(() => {
      const root = document.getElementById("modalRoot");
      const focusable = root?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea, button:not(.modal__close), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 90);
    return () => clearTimeout(t);
  }, [modal]);

  /* keyboard shortcuts: ⌘K palette, Escape priority cmdk → modal → drawer */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        if (cmdOpen) setCmdOpen(false);
        else if (modal) closeModal();
        else if (drawerOpen) setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cmdOpen, modal, drawerOpen, closeModal]);

  /* uploaded logo → CSS vars consumed by the holo styles */
  useEffect(() => {
    const logo = content.uploads.coreLogo;
    if (!logo) {
      document.documentElement.classList.remove("has-custom-logo");
      return;
    }
    document.documentElement.classList.add("has-custom-logo");
    const mask = `url("${logo}")`;
    document.documentElement.style.setProperty("--helm-mask", mask);
    document.documentElement.style.setProperty("--helm-art", mask);
  }, [content.uploads.coreLogo]);

  return (
    <ContentContext.Provider value={content}>
      <UIContext.Provider value={api}>
        {children}

        {/* ------------------------------------------------- modal host */}
        <div
          className={`modal-root ${modal ? "is-open" : ""}`}
          aria-hidden={!modal}
          id="modalRoot"
        >
          {modal && (
            <>
              <div className="modal__scrim" onClick={closeModal} />
              <div
                className={`modal ${modal.size === "sm" ? "modal--sm" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label={modal.label ?? "Dialog"}
              >
                {modal.node}
              </div>
            </>
          )}
        </div>

        {/* ---------------------------------------------------- toasts */}
        <div className="toasts" id="toasts" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast ${t.kind ? `toast--${t.kind}` : ""} ${t.out ? "is-out" : ""}`}
              onClick={() => dismissToast(t.id)}
            >
              <span className="toast__icon">{GLYPH[t.kind ?? ""] ?? "!"}</span>
              <span className="toast__body">
                <strong>{t.title}</strong>
                <span>{t.msg}</span>
              </span>
            </div>
          ))}
        </div>
      </UIContext.Provider>
    </ContentContext.Provider>
  );
}
