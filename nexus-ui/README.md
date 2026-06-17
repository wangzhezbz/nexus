# @nexus/ui · 统一设计系统

山海有灵聚合平台的**统一外观**：科技风主题 + Tailwind 预设 + 通用组件。
**所有子产品前端都用它**，保证全平台长得一模一样。按 React 19 编写（兼容 18+）。

## 安装

现阶段各产品独立仓库，用 git 依赖引入（产品多了再进 monorepo / 私有 npm）：

```bash
pnpm add github:你的组织/nexus-ui   # 或私有 npm: pnpm add @nexus/ui
```

因为本包直接分发 TS 源码，Next 需要转译它：

```js
// next.config.mjs
const nextConfig = { transpilePackages: ["@nexus/ui"] };
export default nextConfig;
```

## 三步接入

### 1) Tailwind 预设
```ts
// tailwind.config.ts
import preset from "@nexus/ui/tailwind-preset";
export default {
  presets: [preset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/@nexus/ui/src/**/*.{ts,tsx}", // 让 Tailwind 扫到组件里的类
  ],
};
```

### 2) 全局样式 + 字体
```tsx
// app/layout.tsx
import "@nexus/ui/globals.css";
import { Orbitron, Rajdhani, JetBrains_Mono } from "next/font/google";

const display = Orbitron({ subsets: ["latin"], weight: ["500","700","900"], variable: "--font-display" });
const head = Rajdhani({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-head" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={`${display.variable} ${head.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```
> 字体由各 app 用 `next/font` 设置这三个 CSS 变量；缺省也有回退，不会崩。

### 3) 用外壳包住页面
```tsx
// 前台（用户端）
import { AppShell } from "@nexus/ui";
export default function Page() {
  return <AppShell product="chat" user={user} onLogout={logout}>...</AppShell>;
}

// 后台（管理端，挂在 /admin/<product>）
import { AdminShell } from "@nexus/ui";
const nav = [{ id:"overview", label:"概览", href:"/admin/chat" }, ...];
<AdminShell product="AI 聊天" nav={nav} activeId="overview" user={user} onLogout={logout}>...</AdminShell>
```

## 组件清单

| 组件 | 用途 |
|---|---|
| `<AppShell>` | 前台外壳：统一顶栏 + 平台导航 + 账号区 |
| `<AdminShell>` | 后台外壳：左侧菜单 + 管理端布局 |
| `<Button variant="neon\|ghost">` | 霓虹 / 幽灵按钮 |
| `<GlassCard hover>` | 玻璃拟态卡片 |
| `<Field>` | 输入框 |
| `<Skeleton>` | 加载骨架 |
| `<Copy text>` | 一键复制 |
| `<ToastProvider>` / `useToast()` | 全局提示 |

## 铁律

- **只用主题 tokens / 预设里的颜色**，不写死十六进制色值。
- 需要新组件/新色 → 提给本包统一加，**各产品不私改**。
- 本包由平台组维护；各产品只升级版本。

## 开发

```bash
npm install
npx tsc --noEmit   # 类型检查
```
