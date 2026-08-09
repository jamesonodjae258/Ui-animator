import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "default" | "lg";
}

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  default: "p-5",
  lg: "p-8",
};

function Card({ children, padding = "default", className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-surface-1 border border-border rounded-[var(--radius)]",
        paddingStyles[padding],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
export type { CardProps };
