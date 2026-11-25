import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/supabase/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "email",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
];

function isValidEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && ALLOWED_EMAIL_OTP_TYPES.includes(value as EmailOtpType);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");
  const nextPath = sanitizeRedirectPath(url.searchParams.get("next"));

  if (tokenHash && isValidEmailOtpType(type)) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }
    return NextResponse.redirect(new URL("/login?error=email_verify_failed", url.origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", url.origin));
}
