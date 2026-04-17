import { NextRequest, NextResponse } from "next/server";
import { normalizeRedirectTo } from "@/lib/auth/redirect";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const redirectTo = normalizeRedirectTo(request.nextUrl.searchParams.get("next"));
  const successUrl = new URL(redirectTo, request.url);
  const failureUrl = new URL("/login", request.url);
  failureUrl.searchParams.set("redirectTo", redirectTo);

  if (!hasSupabaseConfig()) {
    failureUrl.searchParams.set("error", "missing_supabase_config");
    return NextResponse.redirect(failureUrl);
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    failureUrl.searchParams.set("error", "missing_auth_code");
    return NextResponse.redirect(failureUrl);
  }

  const { supabase, applyCookies } = getSupabaseRouteHandlerClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    failureUrl.searchParams.set("error", "auth_callback_failed");
    return applyCookies(NextResponse.redirect(failureUrl));
  }

  return applyCookies(NextResponse.redirect(successUrl));
}
