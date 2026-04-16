import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">欢迎来到演出购票平台</h1>
      <p className="max-w-2xl text-zinc-600">
        这是一个基于 Next.js App Router、TypeScript、Tailwind 和 Supabase Client
        的项目骨架，可用于快速开始演出售票应用开发。
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/shows"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          查看演出列表
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium"
        >
          前往登录
        </Link>
      </div>
    </section>
  );
}
