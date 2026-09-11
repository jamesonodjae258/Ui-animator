import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary px-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full px-4 py-2 text-sm",
            "bg-surface-0 text-text-primary",
            "border border-border rounded-full",
            "placeholder:text-text-muted",
            "transition-colors duration-150",
            "hover:border-border-strong",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)] focus-visible:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-500 focus-visible:ring-red-500" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 px-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted px-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
