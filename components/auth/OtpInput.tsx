"use client";

import { useId } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  ariaLabel = "OTP Code",
}: OtpInputProps) {
  const inputId = useId();
  const slots = Array.from({ length }, (_, idx) => idx);

  return (
    <div className="relative flex justify-center gap-2 sm:gap-3 my-2">
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, length);
          onChange(val);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed"
        aria-label={ariaLabel}
      />
      {slots.map((idx) => {
        const digit = value[idx] || "";
        const isActive =
          !disabled &&
          (value.length === idx || (value.length === length && idx === length - 1));
        return (
          <div
            key={idx}
            className={`size-11 sm:size-13 rounded-xl border flex items-center justify-center text-lg sm:text-xl font-bold font-mono transition-all ${
              digit
                ? "border-zinc-950 bg-zinc-50 text-zinc-950 shadow-xs"
                : isActive
                ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-white"
                : "border-zinc-200 bg-zinc-50/50 text-zinc-400"
            }`}
          >
            {digit}
          </div>
        );
      })}
    </div>
  );
}
