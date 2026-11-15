"use client";

import { IconEye, IconEyeOff, type Icon } from "@tabler/icons-react";
import clsx from "clsx";
import { forwardRef, useId, useState } from "react";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: Icon;
  error?: string;
  /** Extra content under the input (e.g. the password strength bar). */
  footer?: React.ReactNode;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, icon: LeadingIcon, error, footer, type = "text", className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="text-ink text-sm font-medium">
        {label}
      </label>
      <div
        className={clsx(
          "bg-surface focus-within:border-brand-500 focus-within:ring-brand-100 flex h-13 items-center gap-3 rounded-xl border px-4 transition-colors focus-within:ring-4",
          error ? "border-expense" : "border-line hover:border-subtle",
        )}
      >
        {LeadingIcon && <LeadingIcon className="text-subtle shrink-0" size="1.25rem" aria-hidden />}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="text-ink placeholder:text-subtle h-full w-full bg-transparent text-base outline-none focus-visible:outline-none"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-subtle hover:text-ink shrink-0"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <IconEye size="1.375rem" /> : <IconEyeOff size="1.375rem" />}
          </button>
        )}
      </div>
      {footer}
      {error && (
        <p id={errorId} className="text-expense text-sm">
          {error}
        </p>
      )}
    </div>
  );
});
