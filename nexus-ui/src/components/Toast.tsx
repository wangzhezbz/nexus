"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };
type ToastCtx = { push: (type: ToastType, message: string) => void };

const Ctx = createContext<ToastCtx>({ push: () => {} });
let seq = 0;
const ICON: Record<ToastType, string> = { success: "✓", error: "!", info: "i" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);
  const push = useCallback((type: ToastType, message: string) => {
    const id = ++seq;
    setItems((list) => [...list, { id, type, message }]);
    setTimeout(() => remove(id), 4200);
  }, [remove]);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
            <span className="toast-icon">{ICON[t.type]}</span>
            <span className="min-w-0 break-words">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const { push } = useContext(Ctx);
  return {
    success: (m: string) => push("success", m),
    error: (m: string) => push("error", m),
    info: (m: string) => push("info", m),
  };
}
