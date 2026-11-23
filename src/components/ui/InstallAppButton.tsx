"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function detectIsIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIosDevice =
    ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod");
  const isIpadOs =
    window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return isIosDevice || isIpadOs;
}

function detectIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  );
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  useEffect(() => {
    setIsIos(detectIsIos());
    setIsInstalled(detectIsStandalone());

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Abaikan jika browser membatasi service worker (mis. mode privat)
      });
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    setGuideModalOpen(true);
  }

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent-dark">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        Aplikasi sudah terpasang
      </span>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleInstallClick}
        className="px-4 py-2 text-xs sm:text-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 2.5V11.5M9 11.5L5.75 8.25M9 11.5L12.25 8.25M3 14.5H15"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Unduh Aplikasi</span>
      </Button>

      <Modal
        open={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        title={
          isIos
            ? "Pasang simcat di Layar Utama iOS"
            : "Pasang Aplikasi simcat"
        }
        footer={
          <Button variant="primary" onClick={() => setGuideModalOpen(false)}>
            Mengerti
          </Button>
        }
      >
        {isIos ? (
          <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>
              Pastikan halaman ini dibuka menggunakan browser{" "}
              <strong className="text-ink">Safari</strong> di iPhone atau iPad kamu.
            </li>
            <li>
              Ketuk ikon <strong className="text-ink">Bagikan (Share)</strong>{" "}
              <span className="inline-block rounded border border-border-subtle bg-pill px-1.5 py-0.5 font-mono text-xs text-ink">
                ↑
              </span>{" "}
              pada bilah bawah Safari.
            </li>
            <li>
              Gulir ke bawah lalu pilih{" "}
              <strong className="text-ink">Tambah ke Layar Utama</strong>{" "}
              (<em>Add to Home Screen</em>), kemudian ketuk{" "}
              <strong className="text-ink">Tambah</strong> di pojok kanan atas.
            </li>
          </ol>
        ) : (
          <ol className="list-decimal space-y-2.5 pl-5 text-sm leading-relaxed text-ink-secondary">
            <li>
              Buka menu browser (ikon titik tiga{" "}
              <strong className="font-mono text-ink">⋮</strong> di pojok kanan atas Chrome/Edge).
            </li>
            <li>
              Pilih <strong className="text-ink">Instal aplikasi</strong> atau{" "}
              <strong className="text-ink">Tambahkan ke layar utama</strong>.
            </li>
            <li>
              Konfirmasi pemasangan — ikon <strong className="text-ink">simcat</strong>{" "}
              akan muncul langsung di layar utama perangkatmu.
            </li>
          </ol>
        )}
      </Modal>
    </>
  );
}
