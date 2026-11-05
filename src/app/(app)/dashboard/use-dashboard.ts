"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { YearMonth } from "@/lib/format";
import type { FinancialInsights, LatestExpense } from "@/lib/types";

/** Months in the "Receitas x Despesas" chart. */
export const CHART_MONTHS = 6;

export function useLatestExpenses(count = 4) {
  return useQuery({
    queryKey: ["dashboard", "latest-expenses", count],
    queryFn: async () =>
      (await api<LatestExpense[] | undefined>("api/dashboard/lastest-expenses", { query: { count } })) ?? [],
  });
}

export function useInsights({ year, month }: YearMonth) {
  return useQuery({
    queryKey: ["insights", year, month],
    queryFn: () => api<FinancialInsights>("api/financial-insights", { query: { year, month } }),
    staleTime: 5 * 60_000,
  });
}
