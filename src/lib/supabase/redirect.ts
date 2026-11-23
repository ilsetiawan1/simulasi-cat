// Sanitasi path redirect tanpa RegEx untuk mencegah open redirect pada /auth/callback
export function sanitizeRedirectPath(rawNext: string | null | undefined): string {
  if (!rawNext) {
    return "/";
  }

  const trimmed = rawNext.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("\r") ||
    trimmed.includes("\n")
  ) {
    return "/";
  }

  return trimmed;
}
