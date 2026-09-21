import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  className = "",
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  containerClassName = "",
  id,
  disabled,
  ref,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full text-left", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-semibold uppercase text-zinc-600"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            "flex h-11 sm:h-12 w-full rounded-lg border bg-zinc-50 py-2 text-base sm:text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
            leftIcon ? "pl-10" : "pl-4",
            rightElement ? "pr-10" : "pr-4",
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-zinc-200",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {typeof error === "string" && error ? (
        <p className="text-sm font-medium text-red-500 mt-1">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-zinc-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}

Input.displayName = "Input";
