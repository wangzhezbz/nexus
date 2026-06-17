import type { ReactNode } from "react";
import type { NavItem } from "./AppShell";

type User = { email: string; role?: string } | null;

type Props = {
  product: string;             // 产品名（显示在后台标题）
  nav?: NavItem[];             // 后台左侧菜单
  user?: User;
  onLogout?: () => void;
  activeId?: string;
  children: ReactNode;
};

/** 后台外壳：左侧菜单 + 管理端主题。后台统一挂在 /admin/<product> 下。 */
export function AdminShell({ product, nav = [], user = null, onLogout, activeId, children }: Props) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r border-[var(--line)] bg-[rgba(8,13,26,0.6)] p-5">
        <div className="mb-1 font-display tracking-widest text-white">山海有灵</div>
        <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-dim)]">
          {product} · 后台
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <a key={n.id} href={n.href}
               className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                 activeId === n.id
                   ? "bg-[rgba(41,231,255,0.1)] text-cyan-soft"
                   : "text-[var(--muted)] hover:bg-white/[0.03] hover:text-white"}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-2 pt-6 text-sm">
          {user && <div className="truncate font-mono text-[11px] text-[var(--muted-dim)]">{user.email}</div>}
          <button onClick={onLogout} className="btn-ghost w-full px-3 py-2">退出</button>
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
