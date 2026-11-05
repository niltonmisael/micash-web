"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

/** SubscriptionStatus (MiCash.Domain.Enums). */
export enum SubscriptionStatus {
  Pending = 0,
  Active = 1,
  PastDue = 2,
  Cancelled = 3,
  Expired = 4,
  PaymentFailed = 5,
}

export type BillingPeriod = "Monthly" | "Yearly";

/** GET /api/plan (public): the plans sold on the web, with the Pagar.me price. */
export type Plan = { id: number; name: string; price: number; billingPeriod: BillingPeriod };

export type SubscriptionHistoryItem = {
  subscriptionId: number;
  planId: number;
  planName: string;
  status: SubscriptionStatus;
  statusDescription: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => ((await api<Plan[] | undefined>("api/plan")) ?? []).filter((p) => p.price > 0),
    staleTime: 10 * 60_000,
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: ["subscription", "history"],
    queryFn: async () => (await api<SubscriptionHistoryItem[] | undefined>("api/subscription/history")) ?? [],
  });
}

/**
 * POST /api/checkout: the Pagar.me payment link of the plan. Premium is turned on by the Pagar.me webhook,
 * not by this call. 400 when there is an active subscription or a payment still being processed.
 */
export async function createCheckout(planId: number) {
  return (await api<{ checkoutUrl: string }>("api/checkout", { method: "POST", body: { planId } }))
    .checkoutUrl;
}

/** Schedules the cancellation for the end of the paid period: Premium stays until then. */
export function cancelSubscription() {
  return api("api/subscription/cancel", { method: "DELETE" });
}

/** Undoes a scheduled cancellation (only while the paid period lasts). */
export function reactivateSubscription() {
  return api("api/subscription/reactivate", { method: "POST" });
}

export const PERIOD_LABEL: Record<BillingPeriod, string> = { Monthly: "mês", Yearly: "ano" };
