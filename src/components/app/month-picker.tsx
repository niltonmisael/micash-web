"use client";

import { IconChevronLeft, IconChevronRight, IconLock } from "@tabler/icons-react";
import { addMonths, currentYearMonth, monthIndex, monthLabel, type YearMonth } from "@/lib/format";

/** "‹ Novembro 2026 ›". `canGoBack` false shows a lock (month outside the plan history). */
export function MonthPicker({
  value,
  onChange,
  canGoBack = true,
}: {
  value: YearMonth;
  onChange: (value: YearMonth) => void;
  canGoBack?: boolean;
}) {
  const isCurrent = monthIndex(value) === monthIndex(currentYearMonth());
  return (
    <div className="border-line bg-surface flex h-12 items-center gap-1 rounded-xl border px-1.5">
      <button
        type="button"
        onClick={() => onChange(addMonths(value, -1))}
        disabled={!canGoBack}
        className="text-muted hover:bg-brand-50 hover:text-ink disabled:text-subtle rounded-lg p-1.5 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Mês anterior"
        title={canGoBack ? "Mês anterior" : "Histórico mais antigo disponível no Premium"}
      >
        {canGoBack ? <IconChevronLeft size="1.375rem" /> : <IconLock size="1.25rem" />}
      </button>
      <span className="text-ink min-w-36 text-center text-base font-semibold" aria-live="polite">
        {monthLabel(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addMonths(value, 1))}
        className="text-muted hover:bg-brand-50 hover:text-ink rounded-lg p-1.5"
        aria-label="Próximo mês"
      >
        <IconChevronRight size="1.375rem" />
      </button>
      {!isCurrent && (
        <button
          type="button"
          onClick={() => onChange(currentYearMonth())}
          className="text-brand-700 hover:bg-brand-50 rounded-xl px-2 py-1 text-sm font-semibold"
        >
          Hoje
        </button>
      )}
    </div>
  );
}
