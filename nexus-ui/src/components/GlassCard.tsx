import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { hover?: boolean };

export function GlassCard({ hover = false, className = "", ...rest }: Props) {
  return <div className={`glass ${hover ? "glass-hover" : ""} ${className}`} {...rest} />;
}
