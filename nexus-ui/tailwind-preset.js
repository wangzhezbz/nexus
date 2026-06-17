/**
 * @nexus/ui Tailwind 预设 —— 全平台统一主题。
 * 各产品： tailwind.config 里 presets: [require('@nexus/ui/tailwind-preset')]
 * 颜色都映射到 CSS 变量（定义在 globals.css），改主题只改一处。
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: "var(--bg)",
        "ink-2": "var(--bg-2)",
        panel: "var(--panel-solid)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        cyan: { DEFAULT: "var(--cyan)", soft: "var(--cyan-soft)" },
        violet: "var(--violet)",
        mint: "var(--mint)",
        amber: "var(--amber)",
        rose: "var(--rose)",
        ink_text: "var(--text)",
        muted: "var(--muted)",
        "muted-dim": "var(--muted-dim)",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-head)", "sans-serif"],
        head: ["var(--font-head)", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { xl: "16px" },
    },
  },
};
