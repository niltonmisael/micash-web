"use client";

import { IconCheck, IconSparkles } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plans";
import type { BillingPeriod, Plan } from "@/lib/subscription";

/** Gratuito vs Premium cards with the Mensal/Anual switch. Prices come from GET /api/Plan (server). */
export function Pricing({ plans }: { plans: Plan[] }) {
  const cheapest = (period: BillingPeriod) =>
    plans.filter((p) => p.billingPeriod === period).sort((a, b) => a.price - b.price)[0];
  const monthly = cheapest("Monthly");
  const yearly = cheapest("Yearly");
  const [period, setPeriod] = useState<BillingPeriod>("Monthly");
  const selected = period === "Yearly" ? (yearly ?? monthly) : (monthly ?? yearly);
  const saving = monthly && yearly ? Math.round((1 - yearly.price / (monthly.price * 12)) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-10">
      {monthly && yearly && (
        <div
          role="radiogroup"
          aria-label="Periodicidade"
          className="bg-surface border-line flex gap-1 rounded-2xl border p-1.5"
        >
          {(["Monthly", "Yearly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={period === value}
              onClick={() => setPeriod(value)}
              className={clsx(
                "rounded-xl px-6 py-2.5 text-lg font-semibold transition-colors",
                period === value ? "bg-brand-600 text-white" : "text-muted hover:text-ink",
              )}
            >
              {value === "Monthly" ? "Mensal" : "Anual"}
              {value === "Yearly" && saving > 0 && (
                <span className={clsx("ml-2", period === value ? "text-white" : "text-income")}>
                  −{saving}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
        <div className="bg-surface border-line rounded-[1.75rem] border p-9">
          <p className="text-muted text-xl font-semibold">Gratuito</p>
          <p className="text-ink mt-3 text-[3.4rem] leading-none font-bold tracking-tight">R$ 0</p>
          <p className="text-muted mt-3 text-lg">Para começar a se organizar</p>
          <ButtonLink href="/cadastro" variant="outline" block className="mt-8">
            Criar conta grátis
          </ButtonLink>
          <FeatureList items={FREE_FEATURES} />
        </div>

        <div className="bg-surface border-brand-500 shadow-float relative rounded-[1.75rem] border-2 p-9">
          <span className="bg-brand-600 absolute -top-4 right-8 rounded-full px-4 py-1.5 text-sm font-semibold text-white">
            Mais completo
          </span>
          <p className="text-brand-700 text-xl font-semibold">Premium</p>
          {selected ? (
            <>
              <p className="text-ink mt-3 text-[3.4rem] leading-none font-bold tracking-tight">
                {formatMoney(selected.price)}
                <span className="text-muted text-2xl font-semibold">
                  /{selected.billingPeriod === "Yearly" ? "ano" : "mês"}
                </span>
              </p>
              <p className="text-muted mt-3 text-lg">
                {selected.billingPeriod === "Yearly"
                  ? `Equivale a ${formatMoney(selected.price / 12)} por mês`
                  : "Cobrança recorrente · cancele quando quiser"}
              </p>
            </>
          ) : (
            <p className="text-muted mt-3 text-lg">Consulte o preço ao assinar.</p>
          )}
          <ButtonLink href="/assinatura" block className="mt-8">
            <IconSparkles size="1.3rem" aria-hidden /> Assinar Premium
          </ButtonLink>
          <FeatureList items={PREMIUM_FEATURES} />
        </div>
      </div>
      <p className="text-muted max-w-2xl text-center">
        Pagamento seguro pelo Pagar.me, no cartão de crédito. Ao cancelar, você mantém o Premium até o fim do
        período já pago, sem novas cobranças.
      </p>
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 flex flex-col gap-4">
      {items.map((item) => (
        <li key={item} className="text-ink flex items-start gap-3 text-lg">
          <IconCheck size="1.3rem" className="text-income mt-1 shrink-0" aria-hidden /> {item}
        </li>
      ))}
    </ul>
  );
}
