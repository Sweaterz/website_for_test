export default function LoginPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">登录</h1>
      <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-4">
        <p className="mb-3 text-sm text-zinc-600">基础登录页骨架（待接入 Supabase Auth）。</p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="邮箱"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="密码"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            登录
          </button>
        </form>
      </div>
    </section>
  );
}
