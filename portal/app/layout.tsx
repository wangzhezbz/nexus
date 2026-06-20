import "@nexus/ui/globals.css";
import type { Metadata } from "next";
import { Orbitron, Rajdhani, JetBrains_Mono, Ma_Shan_Zheng } from "next/font/google";
import { Topo, Spotlight, ToastProvider } from "@nexus/ui";

const display = Orbitron({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--font-display", display: "swap" });
const head = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-head", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono", display: "swap" });
const brush = Ma_Shan_Zheng({ subsets: ["latin"], weight: ["400"], variable: "--font-brush", display: "swap" });

export const metadata: Metadata = {
  title: "山海AI · 聚合平台",
  description: "聊天、工具、工作流、热榜、API 中转——一个账号全部打通。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${display.variable} ${head.variable} ${mono.variable} ${brush.variable}`}>
      <body>
        <Topo />
        <Spotlight />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
