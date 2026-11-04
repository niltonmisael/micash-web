import { IconCrown, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { ApiError } from "@/lib/api";

/**
 * Plan usage banner ("Você usa 1 de 1 meta do plano Gratuito..."). The web is the sales channel, so it can
 * point to the Premium page; the API texts stay neutral (see the mobile consumption-only rule).
 */
export function PlanUsageBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-100 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl px-6 py-4">
      <IconInfoCircle size="1.4rem" className="text-brand-700 shrink-0" aria-hidden />
      <p className="text-ink min-w-0 flex-1 text-lg">{children}</p>
      <PremiumLink />
    </div>
  );
}

export function PremiumLink({ label = "Conhecer Premium" }: { label?: string }) {
  return (
    <Link
      href="/assinatura"
      className="text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-lg font-semibold"
    >
      <IconCrown size="1.2rem" aria-hidden /> {label}
    </Link>
  );
}

/** Error under a form: the API message, plus the Premium link when the plan blocked the action (403). */
export function ActionError({ error }: { error: unknown }) {
  if (!error) return null;
  const planLimit = error instanceof ApiError && error.isPlanLimit;
  const message =
    error instanceof ApiError ? error.messages.join(" ") : "Não foi possível conectar. Tente novamente.";
  return (
    <div
      role="alert"
      className="bg-expense-soft text-expense flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3"
    >
      <span className="flex-1">{message}</span>
      {planLimit && <PremiumLink />}
    </div>
  );
}
