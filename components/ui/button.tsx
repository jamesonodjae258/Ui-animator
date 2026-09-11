import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-fill-primary text-on-primary hover:opacity-90 active:opacity-95",
  secondary:
    "bg-transparent text-text-primary border border-border hover:bg-surface-1",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-1",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  default: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center gap-2",
          "rounded-full",
          "font-medium transition-all duration-150",
          "active:scale-[0.98] active:translate-y-[0.5px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
          "disabled:pointer-events-none disabled:opacity-50 disabled:scale-100",
          "cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
