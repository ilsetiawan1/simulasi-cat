"use client";

import { useEffect, type ReactNode } from "react";
import { TactileCard } from "./TactileCard";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <TactileCard className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-mono text-lg font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border-[1.5px] border-ink bg-pure text-sm font-bold text-ink hover:bg-pill"
            >
              ×
            </button>
          </div>
          <div className="mt-4 text-sm text-ink-secondary">{children}</div>
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
        </TactileCard>
      </div>
    </div>
  );
}
