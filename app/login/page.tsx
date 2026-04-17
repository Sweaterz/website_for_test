import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">登录</h1>
      <p className="max-w-2xl text-sm text-zinc-600">
        已接入 Supabase Auth。支持邮箱登录/注册与 Google OAuth，微信登录入口已预留，暂未开放。
      </p>
      <LoginForm />
    </section>
  );
}
