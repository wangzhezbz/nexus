import type { Config } from "tailwindcss";

const config: Config = {
  // 用平台统一预设
  presets: [require("@nexus/ui/tailwind-preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/@nexus/ui/src/**/*.{ts,tsx}",
  ],
};
export default config;
