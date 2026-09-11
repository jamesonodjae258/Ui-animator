import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "neutral" | "outline" | "strong" | "subtle";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-text-secondary",
  success: "bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
  neutral: "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]",
  outline: "bg-transparent text-text-secondary border border-border",
  strong: "bg-text-primary text-surface-0",
  subtle: "bg-surface-1 text-text-muted border border-border",
};

function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium",
        "rounded-full",
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
