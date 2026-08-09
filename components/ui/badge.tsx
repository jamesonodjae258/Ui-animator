import type { ReactNode } from "react";

type BadgeVariant = "default" | "strong" | "outline" | "subtle";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-text-secondary",
  strong: "bg-text-primary text-surface-0",
  outline: "bg-transparent text-text-secondary border border-border-strong",
  subtle: "bg-surface-1 text-text-muted border border-border",
};

function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 text-xs font-medium",
        "rounded-[calc(var(--radius)*0.5)]",
        variantStyles[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
