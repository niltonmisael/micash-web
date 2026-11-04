import "server-only";
import type { Plan } from "@/lib/subscription";
import { callApi } from "./micash-api";

/** Public prices (GET /api/Plan) for server-rendered pages. Empty list when the API is unavailable. */
export async function fetchPlans(): Promise<Plan[]> {
  try {
    const response = await callApi("/api/Plan");
    if (!response.ok) return [];
    return ((await response.json()) as Plan[]).filter((plan) => plan.price > 0);
  } catch {
    return [];
  }
}
