"use client";

import { keepPreviousData, useQuery, type QueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { YearMonth } from "./format";
import {
  TransactionType,
  type Category,
  type ExpenseRequest,
  type IncomeCategory,
  type IncomeRequest,
  type Paged,
  type Transaction,
} from "./transactions";

export type TransactionFilters = YearMonth & {
  type?: TransactionType;
  categoryId?: number;
  incomeCategory?: IncomeCategory;
  search?: string;
  page: number;
  pageSize: number;
};

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () =>
      api<Paged<Transaction>>("api/transactions", {
        query: {
          year: filters.year,
          month: filters.month,
          type: filters.type,
          categoryId: filters.categoryId,
          incomeCategory: filters.incomeCategory,
          search: filters.search || undefined,
          page: filters.page,
          pageSize: filters.pageSize,
        },
      }),
    placeholderData: keepPreviousData,
  });
}

/** The user's active expense categories (204 = none). */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await api<{ categories: Category[] } | undefined>("api/Category/all"))?.categories.filter(
        (c) => c.isActive,
      ) ?? [],
  });
}

/** Everything computed from entries: lists, dashboard cards/charts, spending limits and the Mi tips. */
export function invalidateEntries(client: QueryClient) {
  for (const key of ["transactions", "dashboard", "insights", "savings-goals", "limits"]) {
    client.invalidateQueries({ queryKey: [key] });
  }
}

export function saveExpense(body: ExpenseRequest, id?: number) {
  return id
    ? api(`api/Expense/${id}`, { method: "PUT", body })
    : api("api/Expense", { method: "POST", body });
}

export function saveIncome(body: IncomeRequest, id?: number) {
  return id ? api(`api/Income/${id}`, { method: "PUT", body }) : api("api/Income", { method: "POST", body });
}

export function deleteTransaction(transaction: Pick<Transaction, "id" | "type">) {
  const resource = transaction.type === TransactionType.Income ? "Income" : "Expense";
  return api(`api/${resource}/${transaction.id}`, { method: "DELETE" });
}

export type CategoryRequest = { name: string; color: string; icon: string };

export function saveCategory(body: CategoryRequest, id?: number) {
  return id
    ? api(`api/Category/${id}`, { method: "PUT", body })
    : api("api/Category/create", { method: "POST", body });
}

/** The API only inactivates the category: its expenses keep showing it. */
export function deleteCategory(id: number) {
  return api(`api/Category/${id}`, { method: "DELETE" });
}
