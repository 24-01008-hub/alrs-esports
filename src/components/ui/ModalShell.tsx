"use client";

/* ==========================================================================
   ALRS · ModalShell — shared modal chrome (head / scrollable body / foot)
   ========================================================================== */

import type { ReactNode } from "react";
import { useUI } from "./ui-context";

export default function ModalShell({
  title,
  sub,
  foot,
  children,
}: {
  title?: string;
  sub?: string;
  foot?: ReactNode;
  children: ReactNode;
}) {
  const { closeModal } = useUI();
  return (
    <>
      {title && (
        <div className="modal__head">
          <div>
            <h3>{title}</h3>
            {sub && (
              <p className="mono muted" style={{ marginTop: 5 }}>
                {sub}
              </p>
            )}
          </div>
          <button className="modal__close" onClick={closeModal} aria-label="Close">
            ✕
          </button>
        </div>
      )}
      <div className="modal__body">{children}</div>
      {foot && <div className="modal__foot">{foot}</div>}
    </>
  );
}
