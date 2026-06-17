import type { InputHTMLAttributes } from "react";

export function Field({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`field ${className}`} {...rest} />;
}
