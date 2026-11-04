"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { YearMonth } from "./format";
import type { Category } from "./transactions";
import type { SavingsGoal } from "./types";

/* ---------- Savings goals (metas de economia) ---------- */

export enum SavingsMovementType {
  Deposit = 0,
  Withdrawal = 1,
}

export type SavingsMovement = { id: number; type: SavingsMovementType; amount: number; date: string };

export type SavingsGoalDetail = SavingsGoal & {
  remainingAmount: number;
  /** Null without a deadline (or when already reached). */
  monthlyAmountNeeded: number | null;
  movements: SavingsMovement[];
};

export type SavingsGoalRequest = {
  name: string;
  targetAmount: number;
  /** Last day of the chosen month ("2026-12-31"), or null. */
  deadline: string | null;
  icon: string;
  color: string;
  /** Create only: "Já guardado", becomes an initial deposit. */
  initialAmount?: number | null;
};

export function useSavingsGoals() {
  return useQuery({
    queryKey: ["savings-goals"],
    queryFn: async () =>
      (await api<{ savingsGoals: SavingsGoal[] } | undefined>("api/savings-goal"))?.savingsGoals ?? [],
  });
}

/** Detail with "por mês" and the movements. One query per goal card (a user has few goals). */
export function useSavingsGoal(id: number | undefined) {
  return useQuery({
    queryKey: ["savings-goals", id],
    queryFn: () => api<SavingsGoalDetail>(`api/savings-goal/${id}`),
    enabled: id !== undefined,
  });
}

export function saveSavingsGoal(body: SavingsGoalRequest, id?: number) {
  if (id) {
    // RequestUpdateSavingsGoalJson has no initial amount.
    const { name, targetAmount, deadline, icon, color } = body;
    return api(`api/savings-goal/${id}`, {
      method: "PUT",
      body: { name, targetAmount, deadline, icon, color },
    });
  }
  return api("api/savings-goal", { method: "POST", body });
}

export function deleteSavingsGoal(id: number) {
  return api(`api/savings-goal/${id}`, { method: "DELETE" });
}

export function addSavingsMovement(id: number, type: SavingsMovementType, amount: number, date: string) {
  const action = type === SavingsMovementType.Deposit ? "deposit" : "withdraw";
  return api(`api/savings-goal/${id}/${action}`, { method: "POST", body: { amount, date } });
}

/** "2026-12" (input type=month) → "2026-12-31". */
export function lastDayOfMonth(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${monthValue}-${String(day).padStart(2, "0")}`;
}

/* ---------- Spending limits per category (limites de gasto / FinancialGoal) ---------- */

export enum LimitStatus {
  Normal = 0,
  /** 80% or more of the limit. */
  Warning = 1,
  /** 100% or more. */
  Exceeded = 2,
}

type FinancialGoal = {
  id: number;
  categoryId: number;
  categoryName: string;
  targetAmount: number;
  month: number;
  year: number;
};

type FinancialGoalProgress = {
  categoryId: number;
  categoryName: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: LimitStatus;
};

export type SpendingLimit = FinancialGoalProgress & { id: number; icon?: string; color?: string };

/**
 * Limits of the month ready to show. The progress endpoint has no goal id, so it is joined with the
 * month's goals by category (unique per month), and with the categories for icon/color — the same
 * merge the mobile app does (buildGoalLimits). 204 = no limits.
 */
export function useSpendingLimits({ year, month }: YearMonth, categories: Category[] | undefined) {
  return useQuery({
    queryKey: ["limits", year, month],
    queryFn: async () => {
      // api() refreshes the session once for both calls, so they can run in parallel.
      const [progressResponse, goalsResponse] = await Promise.all([
        api<{ goals: FinancialGoalProgress[] } | undefined>("api/financial-goal/progress", {
          query: { year, month },
        }),
        api<{ financialGoals: FinancialGoal[] } | undefined>("api/financial-goal", {
          query: { year, month },
        }),
      ]);
      const progress = progressResponse?.goals ?? [];
      const goals = goalsResponse?.financialGoals ?? [];
      const ids = new Map(goals.map((goal) => [goal.categoryId, goal.id]));
      return progress.flatMap((item) => {
        const id = ids.get(item.categoryId);
        return id === undefined ? [] : [{ ...item, id }];
      });
    },
    select: (limits): SpendingLimit[] =>
      limits
        .map((limit) => {
          const category = categories?.find((c) => c.id === limit.categoryId);
          return { ...limit, icon: category?.icon, color: category?.color };
        })
        .sort((a, b) => b.percentageUsed - a.percentageUsed),
  });
}

export function createLimit(body: { categoryId: number; targetAmount: number } & YearMonth) {
  return api("api/financial-goal", { method: "POST", body });
}

export function updateLimit(id: number, targetAmount: number) {
  return api(`api/financial-goal/${id}`, { method: "PUT", body: { targetAmount } });
}

export function deleteLimit(id: number) {
  return api(`api/financial-goal/${id}`, { method: "DELETE" });
}

/** Premium (CanCopyFinancialGoals): copies all limits of one month into an empty month. */
export function copyLimits(source: YearMonth, target: YearMonth) {
  return api("api/financial-goal/copy", {
    method: "POST",
    body: {
      sourceMonth: source.month,
      sourceYear: source.year,
      targetMonth: target.month,
      targetYear: target.year,
    },
  });
}

/** Goal screens and the dashboard card read these. */
export function invalidateGoals(client: QueryClient) {
  for (const key of ["savings-goals", "limits"]) client.invalidateQueries({ queryKey: [key] });
}
