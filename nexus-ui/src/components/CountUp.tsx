"use client";
import { useEffect, useState } from "react";

export function CountUp({ to, duration = 1200, pad = 0, className }: {
  to: number; duration?: number; pad?: number; className?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className={className}>{pad ? String(v).padStart(pad, "0") : v}</span>;
}
