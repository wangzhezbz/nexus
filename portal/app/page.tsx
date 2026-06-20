"use client";
import { Tilt, SpotlightCard } from "@nexus/ui";
import { useUser, logout } from "@nexus/auth";

const PRODUCTS = [
  { id: "01", name: "AI 聊天", href: "/chat", desc: "多模型对话，一个框用遍 DeepSeek、通义、GPT、Claude。", span: "md:col-span-2 md:row-span-2" },
  { id: "02", name: "AI 工具", href: "/tools", desc: "写作、翻译、总结、绘图，常用的都在。", span: "" },
  { id: "03", name: "工作流", href: "/workflow", desc: "把多步任务串成一条自动流水线。", span: "" },
  { id: "04", name: "每日热榜", href: "/hot", desc: "全网热点一屏看完，定时更新。", span: "" },
  { id: "05", name: "API 中转", href: "/api-relay", desc: "拿一个 Key，接进你自己的程序、Codex、Cursor。", span: "" },
];

export default function Portal() {
  const { user, loading } = useUser();
  return (
    <main className="relative mx-auto max-w-[1700px] px-12 py-16">
      <header className="flex items-center justify-between">
        <span className="flex items-baseline gap-1 text-[var(--text)]">
          <span className="brush text-2xl tracking-wide">山海</span>
          <span className="font-display text-xl font-bold tracking-widest text-[var(--cyan-soft)]">AI</span>
        </span>
        <nav className="flex items-center gap-3 text-sm">
          <a href="/docs" className="text-[var(--muted)] hover:text-[var(--text)]">接入文档</a>
          {!loading && user ? (
            <>
              <span className="font-mono text-xs text-[var(--muted-dim)]">{user.email}</span>
              <button onClick={() => logout().then(() => location.reload())} className="btn-ghost px-4 py-2">退出</button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="btn-ghost px-4 py-2">登录</a>
              <a href="/auth/register" className="btn-neon px-4 py-2">免费注册</a>
            </>
          )}
        </nav>
      </header>

      <section className="mt-20">
        <span className="font-mono text-xs text-[var(--muted)]">shanhaiyouling.com</span>
        <h1 className="mt-4 flex items-baseline gap-3 leading-none">
          <span className="brush title-cn text-[120px]">山海</span>
          <span className="font-display text-[84px] font-bold text-[var(--cyan-soft)]">AI</span>
        </h1>
        <span className="ink-stroke mt-5" />
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
          把常用的 AI 工具收进一个站。聊天、工具、工作流、热榜、API——一个账号，全部打通。
        </p>
      </section>

      <section className="mt-14 grid auto-rows-[200px] grid-cols-1 gap-5 md:grid-cols-4">
        {PRODUCTS.map((p) => (
          <Tilt key={p.id} max={6} className={p.span}>
            <a href={p.href} className="block h-full">
              <SpotlightCard className="glass flex h-full flex-col p-7">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm text-[var(--muted-dim)]">{p.id}</span>
                  <span className="text-[var(--muted-dim)]">↗</span>
                </div>
                <div className="mt-auto">
                  <h3 className="brush text-2xl text-[var(--text)]">{p.name}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">{p.desc}</p>
                </div>
              </SpotlightCard>
            </a>
          </Tilt>
        ))}
      </section>

      <footer className="mt-20 flex items-center justify-between border-t border-[var(--line)] pt-8 text-sm text-[var(--muted-dim)]">
        <span>© 2026 山海AI</span>
        <div className="flex gap-5">
          <a href="/privacy" className="hover:text-[var(--muted)]">隐私政策</a>
          <a href="/terms" className="hover:text-[var(--muted)]">服务条款</a>
        </div>
      </footer>
    </main>
  );
}
