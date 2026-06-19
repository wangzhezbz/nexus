"use client";
import { useRef } from "react";
import type { ReactNode } from "react";

/** 互动卡片：鼠标在卡内移动时，边框与内部柔光跟着光标走；按下轻微回弹。 */
export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--cx", `${e.clientX - r.left}px`);
    el.style.setProperty("--cy", `${e.clientY - r.top}px`);
  }
  return (
    <div ref={ref} onMouseMove={onMove} className={`spot-card ${className}`}>
      {children}
    </div>
  );
}
