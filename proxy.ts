import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseMiddlewareClient } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return NextResponse.next({
      request,
    });
  }

  const { supabase, getResponse } = getSupabaseMiddlewareClient(request);
  await supabase.auth.getUser();
  return getResponse();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
