const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return FALLBACK_SITE_URL;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return FALLBACK_SITE_URL;
    }
    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getGoogleSiteVerification(): string | undefined {
  const token = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return token && token.length > 0 ? token : undefined;
}
