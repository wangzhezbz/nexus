import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "neon" | "ghost";
};

export function Button({ variant = "neon", className = "", ...rest }: Props) {
  const base = variant === "ghost" ? "btn-ghost" : "btn-neon";
  return <button className={`${base} px-5 py-2.5 ${className}`} {...rest} />;
}
