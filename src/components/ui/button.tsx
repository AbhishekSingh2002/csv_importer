import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--ge-orange)] text-white hover:bg-[var(--ge-orange-hover)] shadow-sm disabled:opacity-40 disabled:hover:bg-[var(--ge-orange)] disabled:cursor-not-allowed",
  secondary:
    "bg-white text-[var(--ge-text)] border border-[var(--ge-border)] hover:bg-[var(--ge-content-bg)] dark:bg-[var(--ge-card-bg)]",
  outline:
    "bg-transparent text-[var(--ge-text)] border border-[var(--ge-border)] hover:bg-[var(--ge-content-bg)]",
  ghost: "bg-transparent text-[var(--ge-text-muted)] hover:bg-[var(--ge-content-bg)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-sm px-5 py-3 rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150 whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
