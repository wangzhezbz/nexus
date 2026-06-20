# @nexus/portal · 山海AI 门户首页（也是各产品的接入范本）

shanhaiyouling.com 根域的门户。**同时是各产品团队的参考模板**——它怎么用 `@nexus/ui` + `@nexus/auth`，你们照抄即可。

## 它示范了什么
- `app/layout.tsx`：`import '@nexus/ui/globals.css'` + next/font 提供字体变量 + `<Topo/><Spotlight/>` 山海背景 + `<ToastProvider>`
- `app/page.tsx`：用 `@nexus/ui` 的 `<Tilt/><SpotlightCard/>` + 设计 token；用 `@nexus/auth` 的 `useUser()` 显示登录态
- `app/auth/login`、`register`：用 `@nexus/auth` 的 `login/register`，登录后 cookie 全平台通行
- `tailwind.config.ts`：`presets:[require('@nexus/ui/tailwind-preset')]`
- `next.config.mjs`：`transpilePackages:['@nexus/ui','@nexus/auth']`

## 跑起来
```bash
pnpm install
cp .env.example .env.local   # 本地把 NEXT_PUBLIC_AUTH_BASE 指向 auth-service
pnpm dev                     # http://localhost:3000
```

## 环境变量
```
# 生产：留空（同域，经 nginx 走 /auth/...）
# 本地：指向本地 auth-service
NEXT_PUBLIC_AUTH_BASE=http://localhost:5100
```

## 部署
随 nginx 把根路径 `/` 反代到本服务（见 `../nginx/shanhaiyouling.conf` 的 `portal_up`）。
