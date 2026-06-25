import "@nexus/ui/globals.css";
import type { Metadata } from "next";
import { Topo, Spotlight, ToastProvider } from "@nexus/ui";

// 字体由 @nexus/ui 自托管（globals.css 的 @font-face + :root --font-*），
// 不再用 next/font/google，离线/国内可构建、全平台统一。

export const metadata: Metadata = {
  title: "山海AI · 聚合平台",
  description: "聊天、工具、工作流、热榜、API 中转——一个账号全部打通。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Topo />
        <Spotlight />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
