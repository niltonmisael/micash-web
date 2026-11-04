"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { CurrentSubscription, PlanLimits, UserProfile } from "./types";

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: () => api<UserProfile>("api/user/profile") });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => api<CurrentSubscription>("api/subscription/current"),
  });
}

/** Real plan limits (the prototypes' plan texts are not the source of truth). */
export function usePlanLimits() {
  return useQuery({
    queryKey: ["subscription", "limits"],
    queryFn: () => api<PlanLimits>("api/subscription/limits"),
  });
}
