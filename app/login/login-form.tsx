"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizeRedirectTo } from "@/lib/auth/redirect";
import { getSupabaseClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";

type AuthMode = "sign-in" | "sign-up";

function getCallbackUrl(redirectTo: string) {
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", redirectTo);
  return callbackUrl.toString();
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => normalizeRedirectTo(searchParams.get("redirectTo")),
    [searchParams],
  );
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setMessage("");
      setErrorMessage("");

      try {
        const supabase = getSupabaseClient();

        if (mode === "sign-in") {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setErrorMessage(error.message);
            return;
          }

          router.replace(redirectTo);
          router.refresh();
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getCallbackUrl(redirectTo),
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setMessage("注册成功，请查收邮箱中的确认邮件后完成登录。");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "认证请求失败");
      }
    });
  }

  function handleOauthSignIn(provider: "github") {
    startTransition(async () => {
      setMessage("");
      setErrorMessage("");

      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: getCallbackUrl(redirectTo),
          },
        });

        if (error) {
          setErrorMessage(error.message);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "OAuth 登录失败");
      }
    });
  }

  const callbackError = searchParams.get("error");
  const isConfigured = hasSupabaseConfig();

  return (
    <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`rounded-md px-3 py-1.5 ${
            mode === "sign-in" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          邮箱登录
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`rounded-md px-3 py-1.5 ${
            mode === "sign-up" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          邮箱注册
        </button>
      </div>

      {!isConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          缺少 Supabase 环境变量，暂时无法使用登录功能。
        </p>
      ) : null}

      {callbackError ? (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          登录回调失败，请重试。
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {message ? (
        <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <form className="space-y-3" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="昵称（选填）"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        ) : null}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="邮箱"
          autoComplete="email"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="密码"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={!isConfigured || isPending}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {mode === "sign-in" ? "登录" : "注册"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        <span>或</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <button
        type="button"
        onClick={() => handleOauthSignIn("github")}
        disabled={!isConfigured || isPending}
        className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-400"
      >
        使用 GitHub 登录
      </button>
    </div>
  );
}
