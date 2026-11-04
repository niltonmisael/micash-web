"use client";

import clsx from "clsx";
import { useRef } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
};

/** One box per digit; typing advances, Backspace goes back, pasting fills every box. */
export function OtpInput({ value, onChange, length = 6, disabled, invalid, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (index: number) => refs.current[Math.max(0, Math.min(index, length - 1))]?.focus();

  const setFrom = (index: number, typed: string) => {
    const clean = typed.replace(/\D/g, "");
    if (!clean) return;
    const next = (value.slice(0, index) + clean).slice(0, length);
    onChange(next);
    focus(next.length);
  };

  return (
    <div className="flex justify-center gap-3 sm:gap-4" role="group" aria-label="Código de verificação">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          aria-label={`Dígito ${index + 1}`}
          maxLength={length}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setFrom(index, e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            setFrom(0, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const cut = digit ? index : index - 1;
              if (cut < 0) return;
              onChange(value.slice(0, cut));
              focus(cut);
            } else if (e.key === "ArrowLeft") focus(index - 1);
            else if (e.key === "ArrowRight") focus(index + 1);
          }}
          className={clsx(
            "bg-brand-50 text-ink focus:border-brand-500 size-14 rounded-2xl border text-center text-3xl font-bold outline-none sm:h-24 sm:w-[5.25rem] sm:text-4xl",
            invalid ? "border-expense" : "border-line",
          )}
        />
      ))}
    </div>
  );
}
