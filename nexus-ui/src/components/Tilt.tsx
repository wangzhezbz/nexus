"use client";
import { useRef } from "react";
import type { ReactNode } from "react";

export function Tilt({ children, className = "", max = 8 }: {
  children: ReactNode; className?: string; max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={`tilt ${className}`}>
      {children}
    </div>
  );
}
