import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { supabase, applyCookies } = getSupabaseRouteHandlerClient(request);
  await supabase.auth.signOut();

  return applyCookies(
    NextResponse.redirect(new URL("/login", request.url)),
  );
}
