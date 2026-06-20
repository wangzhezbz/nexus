"use client";
import { useState } from "react";
import { login } from "@nexus/auth";
import { useToast } from "@nexus/ui";

export default function Login() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      // 登录成功，cookie 已写入，全平台通行。回跳来源或首页。
      const next = new URLSearchParams(location.search).get("next") || "/";
      location.href = next;
    } catch (err: any) {
      toast.error(err?.message || "登录失败");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form onSubmit={submit} className="glass w-full max-w-sm p-8">
        <div className="flex items-baseline gap-1">
          <span className="brush text-2xl text-[var(--text)]">山海</span>
          <span className="font-display text-lg font-bold text-[var(--cyan-soft)]">AI</span>
        </div>
        <h1 className="mt-4 text-xl text-[var(--text)]">登录</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">一个账号，全平台通用</p>
        <input className="field mt-6" type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field mt-3" type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn-neon mt-6 w-full py-2.5" disabled={busy}>{busy ? "登录中…" : "登录"}</button>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          还没有账号？<a href="/auth/register" className="text-[var(--cyan-soft)]">免费注册</a>
        </p>
      </form>
    </main>
  );
}
