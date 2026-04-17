import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "演出购票平台",
  description: "基于 Next.js + Supabase 的演出购票项目骨架",
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/shows", label: "演出列表" },
  { href: "/login", label: "登录" },
  { href: "/orders", label: "我的订单" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userEmail: string | null = null;

  if (hasSupabaseConfig()) {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold">
              演出购票平台
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-zinc-600 transition hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              ))}
              {userEmail ? (
                <>
                  <span className="text-zinc-500">{userEmail}</span>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-zinc-600 transition hover:text-zinc-900"
                    >
                      退出
                    </button>
                  </form>
                </>
              ) : null}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
