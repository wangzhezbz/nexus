# @nexus/auth · 单点登录客户端

各产品前端用它对接中央 [auth-service](../auth-service)，实现"登录一次、全平台通行"。
浏览器请求带 cookie，同域子路径下 JWT 自动随 cookie 走。

## 安装
```bash
pnpm add @nexus/auth
# Next 需转译本包源码：next.config 里 transpilePackages: ['@nexus/auth','@nexus/ui']
```

## 环境变量
```
# 生产：留空（同域，经 nginx 走 /auth/...）
# 本地：指向 auth-service
NEXT_PUBLIC_AUTH_BASE=http://localhost:5100
```

## 用法

### 读取登录态 / 角色
```tsx
"use client";
import { useUser } from "@nexus/auth";

export default function Nav() {
  const { user, loading, isAdmin } = useUser();
  if (loading) return null;
  if (!user) return <a href="/auth/login">登录</a>;
  return <span>{user.email}{isAdmin && " · 管理员"}</span>;
}
```

### 登录 / 注册 / 退出
```tsx
import { login, register, logout } from "@nexus/auth";

await login(email, password);     // 成功后 cookie 已写入，全平台通行
await register(email, password);
await logout();                   // 清 cookie
```

### 保护页面（未登录跳中央登录）
```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@nexus/auth";

export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/auth/login"); }, [loading, user, router]);
  if (loading || !user) return null;
  return <>{children}</>;
}
```

### 后台页面（要管理员）
```tsx
const { user, loading, isAdmin } = useUser();
// 非 admin → 跳走或显示 403。后端同时用 admin_required 兜底（见 auth-service README）。
```

> 前端的角色校验只是体验层；**真正的权限由各产品后端用同一个 JWT 校验**（见 auth-service 的"校验片段"）。
