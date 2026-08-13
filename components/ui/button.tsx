import * as React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles according to CourtGrid Premium Light Mode design system
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none";

    const variants = {
      primary:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm font-semibold border border-emerald-500/20",
      secondary:
        "bg-white text-zinc-950 border border-zinc-200 hover:bg-zinc-50 shadow-xs font-semibold",
      outline:
        "bg-transparent text-zinc-950 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 font-medium",
      ghost:
        "bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 font-medium",
      destructive:
        "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold",
    };

    const sizes = {
      default: "h-11 sm:h-10 px-4 py-2 text-sm rounded-lg",
      sm: "min-h-11 sm:h-8 px-3 text-xs rounded-md",
      lg: "h-12 px-6 text-base rounded-xl",
      icon: "h-11 w-11 sm:h-10 sm:w-10 text-sm rounded-lg p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
        ) : leftIcon ? (
          <span className="mr-2 shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="ml-2 shrink-0">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
