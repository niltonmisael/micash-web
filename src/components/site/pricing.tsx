"use client";

import { IconCheck } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/plans";
import type { BillingPeriod, Plan } from "@/lib/subscription";

/** Gratuito vs Premium with the Mensal/Anual switch. Prices come from GET /api/plan (server). */
export function Pricing({ plans }: { plans: Plan[] }) {
  const cheapest = (period: BillingPeriod) =>
    plans.filter((p) => p.billingPeriod === period).sort((a, b) => a.price - b.price)[0];
  const monthly = cheapest("Monthly");
  const yearly = cheapest("Yearly");
  const [period, setPeriod] = useState<BillingPeriod>("Monthly");
  const selected = period === "Yearly" ? (yearly ?? monthly) : (monthly ?? yearly);
  const saving = monthly && yearly ? Math.round((1 - yearly.price / (monthly.price * 12)) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid w-full gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-5">
        {/* Gratuito */}
        <div className="bg-surface shadow-card flex flex-col rounded-[var(--radius-card)] p-7 sm:p-9">
          <h3 className="text-ink text-xl font-bold">Gratuito</h3>
          <p className="text-muted mt-1">Para começar a se organizar</p>
          <p className="figure text-ink mt-8 text-[3.25rem] leading-none font-bold">R$ 0</p>
          <p className="text-muted mt-2 h-6 text-[0.95rem]">Sem prazo e sem cartão</p>
          <FeatureList items={FREE_FEATURES} />
          <ButtonLink href="/cadastro" variant="outline" block className="mt-auto">
            Criar conta grátis
          </ButtonLink>
        </div>

        {/* Premium */}
        <div className="bg-rail text-rail-ink flex flex-col rounded-[var(--radius-card)] p-7 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Premium</h3>
              <p className="text-rail-muted mt-1">Para planejar o mês e o ano</p>
            </div>
            {monthly && yearly && (
              <div
                role="radiogroup"
                aria-label="Periodicidade"
                className="bg-rail-raised flex gap-1 rounded-xl p-1"
              >
                {(["Monthly", "Yearly"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={period === value}
                    onClick={() => setPeriod(value)}
                    className={clsx(
                      "rounded-lg px-4 py-2 text-[0.95rem] font-semibold transition-colors",
                      period === value ? "bg-rail-ink text-rail" : "text-rail-muted hover:text-rail-ink",
                    )}
                  >
                    {value === "Monthly" ? "Mensal" : "Anual"}
                    {value === "Yearly" && saving > 0 && (
                      <span className={clsx("ml-1.5", period === value ? "text-income" : "text-[#7fd3a1]")}>
                        −{saving}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selected ? (
            <>
              <p className="figure mt-8 text-[3.25rem] leading-none font-bold">
                {formatMoney(selected.price)}
                <span className="text-rail-muted font-sans text-xl font-medium tracking-normal">
                  /{selected.billingPeriod === "Yearly" ? "ano" : "mês"}
                </span>
              </p>
              <p className="text-rail-muted mt-2 h-6 text-[0.95rem]">
                {selected.billingPeriod === "Yearly"
                  ? `Equivale a ${formatMoney(selected.price / 12)} por mês`
                  : "Cobrança recorrente, cancele quando quiser"}
              </p>
            </>
          ) : (
            <p className="text-rail-muted mt-8 text-lg">Consulte o preço ao assinar.</p>
          )}
          <FeatureList items={PREMIUM_FEATURES} onDark />
          <ButtonLink href="/assinatura" block className="mt-auto">
            Assinar Premium
          </ButtonLink>
        </div>
      </div>
      <p className="text-muted max-w-3xl text-[0.95rem]">
        Pagamento seguro pelo Pagar.me, no cartão de crédito. Ao cancelar, você mantém o Premium até o fim do
        período já pago, sem novas cobranças.
      </p>
    </div>
  );
}

function FeatureList({ items, onDark }: { items: string[]; onDark?: boolean }) {
  return (
    <ul
      className={clsx(
        "mt-8 mb-9 flex flex-col border-t",
        onDark ? "border-rail-line text-rail-ink" : "border-line text-ink",
      )}
    >
      {items.map((item) => (
        <li
          key={item}
          className={clsx(
            "flex items-start gap-3 border-b py-3",
            onDark ? "border-rail-line" : "border-line",
          )}
        >
          <IconCheck
            size="1.15rem"
            className={clsx("mt-0.5 shrink-0", onDark ? "text-brand-500" : "text-income")}
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
