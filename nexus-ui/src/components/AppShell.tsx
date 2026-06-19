import type { ReactNode } from "react";

export type NavItem = { id: string; label: string; href: string };

/** 平台统一前台导航（各产品子路径）。可在调用处覆盖。 */
export const PLATFORM_NAV: NavItem[] = [
  { id: "chat", label: "AI 聊天", href: "/chat" },
  { id: "tools", label: "AI 工具", href: "/tools" },
  { id: "workflow", label: "工作流", href: "/workflow" },
  { id: "hot", label: "每日热榜", href: "/hot" },
  { id: "api-relay", label: "API 中转", href: "/api-relay" },
];

type User = { email: string; role?: string } | null;

type Props = {
  product?: string;            // 当前产品 id，用于高亮
  nav?: NavItem[];
  user?: User;
  onLogout?: () => void;
  brand?: string;
  children: ReactNode;
};

export function AppShell({
  product, nav = PLATFORM_NAV, user = null, onLogout,
  brand = "山海AI", children,
}: Props) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(8,13,26,0.7)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <a href="/" className="flex items-center gap-2 font-display tracking-widest text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line-strong)] bg-[rgba(41,231,255,0.08)] text-cyan-soft">山</span>
            {brand}
          </a>
          <nav className="hidden flex-1 items-center gap-1 sm:flex">
            {nav.map((n) => (
              <a key={n.id} href={n.href}
                 className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                   product === n.id
                     ? "bg-[rgba(41,231,255,0.1)] text-cyan-soft"
                     : "text-[var(--muted)] hover:text-white"}`}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden font-mono text-[var(--muted)] sm:inline">{user.email}</span>
                <button onClick={onLogout} className="btn-ghost px-3 py-1.5">退出</button>
              </>
            ) : (
              <a href="/auth/login" className="btn-neon px-4 py-1.5">登录</a>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
