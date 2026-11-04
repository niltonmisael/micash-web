"use client";

import { IconChevronDown, type Icon } from "@tabler/icons-react";
import clsx from "clsx";
import { useId } from "react";
import { formatMoney } from "@/lib/format";

/** Pill tabs (Todas / Receitas / Despesas, Despesa / Receita). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
  activeClass = "bg-brand-600 text-white",
}: {
  options: { value: T; label: React.ReactNode; activeClass?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  activeClass?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={clsx("flex gap-1 rounded-2xl p-1.5", className ?? "bg-brand-50")}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={clsx(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-lg font-semibold whitespace-nowrap transition-colors",
              active ? (option.activeClass ?? activeClass) : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Native select with the app look (keeps keyboard and screen reader behavior for free). */
export function Select({
  label,
  hideLabel,
  icon: LeadingIcon,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hideLabel?: boolean; icon?: Icon }) {
  const id = useId();
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={clsx("text-muted text-base font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <div className="border-line focus-within:border-brand-500 focus-within:ring-brand-100 bg-surface relative flex h-16 items-center rounded-2xl border focus-within:ring-4">
        {LeadingIcon && (
          <LeadingIcon
            size="1.3rem"
            className="text-subtle pointer-events-none absolute left-4"
            aria-hidden
          />
        )}
        <select
          id={id}
          className={clsx(
            "text-ink h-full w-full cursor-pointer appearance-none bg-transparent pr-11 text-lg outline-none focus-visible:outline-none",
            LeadingIcon ? "pl-12" : "pl-5",
          )}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown
          size="1.2rem"
          className="text-subtle pointer-events-none absolute right-4"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hideLabel,
  icon: LeadingIcon,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Keeps the label for screen readers only (the row already shows the title). */
  hideLabel?: boolean;
  icon?: Icon;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className={clsx("text-ink flex items-center gap-3 text-lg", hideLabel && "sr-only")}>
        {LeadingIcon && <LeadingIcon size="1.4rem" className="text-brand-700" aria-hidden />}
        {label}
      </span>
      <span className="relative">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={clsx(
            "peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-surface block h-9 w-16 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            checked ? "bg-brand-600" : "bg-line",
          )}
          aria-hidden
        />
        <span
          className={clsx(
            "absolute top-1 left-1 size-7 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-7",
          )}
          aria-hidden
        />
      </span>
    </label>
  );
}

/**
 * Amount typed as cents, like a cash register: "28490" → R$ 284,90. Avoids decimal-separator confusion.
 * `cents` is the source of truth; only digits are read from the input.
 */
export function MoneyInput({
  cents,
  onChange,
  label,
  colorClass,
  error,
}: {
  cents: number;
  onChange: (cents: number) => void;
  label: string;
  colorClass: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col items-center gap-1">
      <label htmlFor={id} className="text-muted text-lg">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={formatMoney(cents / 100)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11);
          onChange(Number(digits || "0"));
        }}
        onFocus={(e) => {
          const input = e.currentTarget;
          requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
        }}
        aria-invalid={error ? true : undefined}
        className={clsx(
          "w-full bg-transparent text-center text-[3.75rem] leading-tight font-bold tracking-tight tabular-nums outline-none focus-visible:outline-none",
          colorClass,
        )}
      />
      {error && <p className="text-expense text-base">{error}</p>}
    </div>
  );
}
