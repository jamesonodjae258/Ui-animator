import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "default" | "lg";
}

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  default: "p-6",
  lg: "p-8",
};

function Card({ children, padding = "default", className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-surface-0 border border-border rounded-2xl",
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
