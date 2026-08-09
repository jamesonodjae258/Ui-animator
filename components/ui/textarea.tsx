import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        {hint && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            "w-full px-3 py-2.5 text-sm leading-relaxed",
            "bg-surface-1 text-text-primary",
            "border border-border rounded-[var(--radius)]",
            "placeholder:text-text-muted",
            "transition-colors duration-150",
            "hover:border-border-strong",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-y",
            error ? "border-text-muted" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="text-xs text-text-muted">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
