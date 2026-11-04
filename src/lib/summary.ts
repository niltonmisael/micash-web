"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { addMonths, currentYearMonth, monthIndex, type YearMonth } from "./format";
import type { DailySummary, ExpenseCategorySummary, MonthlySummary, PlanLimits } from "./types";

/** Oldest month the plan shows (Free: current + 3 previous). null = no limit. */
export function oldestAllowedMonth(limits: PlanLimits | undefined): YearMonth | null {
  if (!limits || limits.historyMonths === null) return null;
  return addMonths(currentYearMonth(), -limits.historyMonths);
}

/** Same rule as PlanLimits.AllowsMonth in the API (future months are always allowed). */
export function isMonthAllowed(month: YearMonth, limits: PlanLimits | undefined) {
  const oldest = oldestAllowedMonth(limits);
  return !oldest || monthIndex(month) >= monthIndex(oldest);
}

const ym = ({ year, month }: YearMonth) => ({ year, month });

/** `count` months ending at `last`, oldest first. */
export function monthsEndingAt(last: YearMonth, count: number): YearMonth[] {
  return Array.from({ length: count }, (_, i) => addMonths(last, i - (count - 1)));
}

const isPlanLimit = (error: unknown) => error instanceof ApiError && error.isPlanLimit;

export type MonthBar = YearMonth & { summary?: MonthlySummary; locked: boolean; loading: boolean };

/**
 * Monthly summaries of `count` months ending at `last`. Months outside the plan answer 403
 * PLAN_LIMIT_REACHED and come back `locked` (shown with a lock, like in the app).
 */
export function useMonthlySeries(last: YearMonth, count: number): MonthBar[] {
  const months = monthsEndingAt(last, count);
  const results = useQueries({
    queries: months.map((month) => ({
      queryKey: ["dashboard", "monthly-summary", month.year, month.month],
      queryFn: () => api<MonthlySummary>("api/Dashboard/monthly-summary", { query: ym(month) }),
    })),
  });

  return months.map((month, i) => ({
    ...month,
    summary: results[i].data,
    locked: isPlanLimit(results[i].error),
    loading: results[i].isPending,
  }));
}

export function useExpensesByCategory(month: YearMonth) {
  return useQuery({
    queryKey: ["dashboard", "expenses-by-category", month.year, month.month],
    queryFn: () => api<ExpenseCategorySummary[]>("api/Dashboard/expenses-by-category", { query: ym(month) }),
  });
}

/** Expenses per category summed over several months (largest first). */
export function useExpensesByCategoryOver(months: YearMonth[]) {
  const results = useQueries({
    queries: months.map((month) => ({
      queryKey: ["dashboard", "expenses-by-category", month.year, month.month],
      queryFn: () =>
        api<ExpenseCategorySummary[]>("api/Dashboard/expenses-by-category", { query: ym(month) }),
    })),
  });

  const totals = new Map<number, ExpenseCategorySummary>();
  for (const result of results) {
    for (const item of result.data ?? []) {
      const current = totals.get(item.categoryId);
      totals.set(
        item.categoryId,
        current ? { ...current, amount: current.amount + item.amount } : { ...item },
      );
    }
  }
  const all = [...totals.values()];
  const sum = all.reduce((acc, item) => acc + item.amount, 0);

  return {
    data: all
      .map((item) => ({ ...item, percentage: sum > 0 ? (item.amount / sum) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount),
    loading: results.some((r) => r.isPending),
    error: results.find((r) => r.error && !isPlanLimit(r.error))?.error,
  };
}

export function useDailySummary(month: YearMonth, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "daily-summary", month.year, month.month],
    queryFn: () => api<DailySummary>("api/Dashboard/daily-summary", { query: ym(month) }),
    enabled,
  });
}
