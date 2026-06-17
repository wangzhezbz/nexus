"use client";
import { useState } from "react";

export function Copy({ text, label = "复制" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch {}
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }
  return (
    <button onClick={copy} className={`btn-copy ${done ? "copied" : ""}`} type="button">
      {done ? "✓ 已复制" : label}
    </button>
  );
}
