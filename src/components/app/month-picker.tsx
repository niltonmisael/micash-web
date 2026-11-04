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
    <div className="border-line bg-surface flex h-16 items-center gap-2 rounded-2xl border px-3">
      <button
        type="button"
        onClick={() => onChange(addMonths(value, -1))}
        disabled={!canGoBack}
        className="text-muted hover:bg-brand-50 disabled:text-subtle rounded-xl p-2 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Mês anterior"
        title={canGoBack ? "Mês anterior" : "Histórico mais antigo disponível no Premium"}
      >
        {canGoBack ? <IconChevronLeft size="1.375rem" /> : <IconLock size="1.25rem" />}
      </button>
      <span className="text-ink min-w-40 text-center text-xl font-semibold" aria-live="polite">
        {monthLabel(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(addMonths(value, 1))}
        className="text-muted hover:bg-brand-50 rounded-xl p-2"
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
