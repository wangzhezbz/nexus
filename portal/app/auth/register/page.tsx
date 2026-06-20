"use client";
import { useState } from "react";
import { register } from "@nexus/auth";
import { useToast } from "@nexus/ui";

export default function Register() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(email, password);
      location.href = "/";
    } catch (err: any) {
      toast.error(err?.message || "注册失败");
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
        <h1 className="mt-4 text-xl text-[var(--text)]">注册</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">注册即开通全平台账号</p>
        <input className="field mt-6" type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="field mt-3" type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button className="btn-neon mt-6 w-full py-2.5" disabled={busy}>{busy ? "注册中…" : "注册"}</button>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          已有账号？<a href="/auth/login" className="text-[var(--cyan-soft)]">去登录</a>
        </p>
      </form>
    </main>
  );
}
