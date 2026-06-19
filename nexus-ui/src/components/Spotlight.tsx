"use client";
import { useEffect } from "react";

/** 鼠标跟随聚光：一束柔和青玉光晕跟着光标走，给暗色页面注入生气。全局装一次。 */
export function Spotlight() {
  useEffect(() => {
    const root = document.documentElement;
    const onMove = (e: MouseEvent) => {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return <div className="spotlight" aria-hidden="true" />;
}
