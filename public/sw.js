// Minimal Service Worker untuk mendukung PWA Installability (beforeinstallprompt)
// Tidak meng-cache endpoint API atau sesi autentikasi agar data selalu akurat.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Pass-through ke network default browser
});
