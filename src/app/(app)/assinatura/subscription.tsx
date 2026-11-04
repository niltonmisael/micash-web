"use client";

import { IconAlertTriangle, IconCheck, IconCrown, IconLoader2 } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { ActionError } from "@/components/app/premium-notice";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/controls";
import { Alert, Card, ProgressBar, Skeleton } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/ui/overlay";
import { api, errorMessage } from "@/lib/api";
import { currentYearMonth, formatApiDate, formatMoney } from "@/lib/format";
import { useSavingsGoals, useSpendingLimits } from "@/lib/goals";
import { usePlanLimits } from "@/lib/queries";
import {
  cancelSubscription,
  createCheckout,
  PERIOD_LABEL,
  reactivateSubscription,
  SubscriptionStatus,
  usePlans,
  useSubscriptionHistory,
  type BillingPeriod,
} from "@/lib/subscription";
import type { CurrentSubscription } from "@/lib/types";

/** Real Premium benefits (PlanLimits.Premium in the API) — not the prototype's texts. */
const PREMIUM_BENEFITS = [
  "Mi Assistente com até 30 perguntas por dia",
  "Metas de economia e limites de gasto ilimitados",
  "Histórico completo no dashboard e nos relatórios",
  "Previsão do fim do mês e dicas completas do Mi",
  "Aviso quando um limite de gasto chega a 80%",
  "Copiar os limites de um mês para o outro",
];

/** After the checkout opens, the page waits for the Pagar.me webhook (polling) for up to this long. */
const AWAITING_KEY = "micash-awaiting-payment";
const AWAITING_MS = 15 * 60_000;

function readAwaiting() {
  try {
    const since = Number(sessionStorage.getItem(AWAITING_KEY));
    return since && Date.now() - since < AWAITING_MS ? since : 0;
  } catch {
    return 0;
  }
}

export function Subscription() {
  const client = useQueryClient();
  const [awaitingSince, setAwaitingSince] = useState(0);
  useEffect(() => {
    // Back from Pagar.me (flow_settings.success_url = /assinatura?pagamento=concluido): wait for the webhook.
    const params = new URLSearchParams(window.location.search);
    if (params.get("pagamento") === "concluido") {
      try {
        sessionStorage.setItem(AWAITING_KEY, String(Date.now()));
      } catch {}
      window.history.replaceState(null, "", window.location.pathname);
    }
    setAwaitingSince(readAwaiting());
  }, []);

  // While a payment is being confirmed, check every 5s whether the webhook already turned Premium on.
  const current = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => api<CurrentSubscription>("api/subscription/current"),
    refetchInterval: (query) => (awaitingSince && !query.state.data?.isPremium ? 5000 : false),
  });

  useEffect(() => {
    if (awaitingSince && current.data?.isPremium) {
      try {
        sessionStorage.removeItem(AWAITING_KEY);
      } catch {}
      setAwaitingSince(0);
      // Limits change with the plan (dashboard history, goals, chat).
      client.invalidateQueries();
    }
  }, [awaitingSince, current.data?.isPremium, client]);

  const startAwaiting = () => {
    const now = Date.now();
    try {
      sessionStorage.setItem(AWAITING_KEY, String(now));
    } catch {}
    setAwaitingSince(now);
  };

  const subscription = current.data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Assinatura" subtitle="Gerencie seu plano e cobranças" />

      {awaitingSince > 0 && !subscription?.isPremium && (
        <Alert tone="info">
          <span className="flex items-center gap-2">
            <IconLoader2 size="1.2rem" className="animate-spin" aria-hidden />
            Aguardando a confirmação do pagamento. Conclua o pagamento na aba do Pagar.me; esta página
            atualiza sozinha.
          </span>
        </Alert>
      )}

      {current.isPending ? (
        <Skeleton className="h-80" />
      ) : current.isError ? (
        <Alert>{errorMessage(current.error)}</Alert>
      ) : subscription!.isPremium ? (
        <div className="grid max-w-6xl gap-6 xl:grid-cols-[1.2fr_1fr]">
          <PremiumCard subscription={subscription!} />
          <HistoryCard />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <FreeUsageCard />
            <HistoryCard />
          </div>
          <OfferCard onCheckoutOpened={startAwaiting} awaiting={awaitingSince > 0} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Gratuito ---------------- */

function FreeUsageCard() {
  const limits = usePlanLimits();
  const goals = useSavingsGoals();
  const spending = useSpendingLimits(currentYearMonth(), undefined);
  const data = limits.data;

  const rows = data
    ? [
        { label: "Metas de economia", used: goals.data?.length ?? 0, max: data.maxSavingsGoals },
        {
          label: "Limites de gasto neste mês",
          used: spending.data?.length ?? 0,
          max: data.maxFinancialGoalsPerMonth,
        },
        {
          label: data.chat.period === "day" ? "Perguntas ao Mi hoje" : "Perguntas ao Mi este mês",
          used: data.chat.used,
          max: data.chat.limit,
        },
      ]
    : [];

  return (
    <Card className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted">Seu plano atual</p>
          <h2 className="text-ink text-[2.2rem] font-bold">Gratuito</h2>
        </div>
        <span className="bg-income-soft text-income rounded-full px-4 py-1.5 font-semibold">Ativo</span>
      </div>
      {limits.isPending ? (
        <Skeleton className="mt-6 h-40" />
      ) : (
        <ul className="mt-6 flex flex-col gap-6">
          {rows.map((row) => {
            const percent = row.max ? (row.used / row.max) * 100 : 0;
            return (
              <li key={row.label}>
                <div className="flex justify-between gap-4 text-lg">
                  <span className="text-ink">{row.label}</span>
                  <span className="text-muted tabular-nums">
                    <strong className="text-ink">{Math.min(row.used, row.max ?? row.used)}</strong> /{" "}
                    {row.max ?? "∞"}
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  className="mt-2"
                  barClassName={percent >= 100 ? "bg-warning" : "bg-brand-500"}
                  label={row.label}
                />
              </li>
            );
          })}
        </ul>
      )}
      {data?.historyMonths !== null && data?.historyMonths !== undefined && (
        <p className="text-muted mt-6">
          Histórico: mês atual e os {data.historyMonths} meses anteriores no dashboard e nos relatórios.
        </p>
      )}
    </Card>
  );
}

function OfferCard({ onCheckoutOpened, awaiting }: { onCheckoutOpened: () => void; awaiting: boolean }) {
  const plans = usePlans();
  const [period, setPeriod] = useState<BillingPeriod>("Monthly");
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(false);

  // Cheapest of each period: a misconfigured plan never shows a yearly price as monthly.
  const cheapest = (period: BillingPeriod) =>
    plans.data?.filter((p) => p.billingPeriod === period).sort((a, b) => a.price - b.price)[0];
  const monthly = cheapest("Monthly");
  const yearly = cheapest("Yearly");
  const selected = period === "Yearly" ? (yearly ?? monthly) : (monthly ?? yearly);
  const savingPercent =
    monthly && yearly ? Math.round((1 - yearly.price / (monthly.price * 12)) * 100) : undefined;

  const subscribe = async () => {
    if (!selected) return;
    setError(undefined);
    setLoading(true);
    // Opened before the request so the browser does not block it as a popup.
    const tab = window.open("", "_blank");
    try {
      const url = await createCheckout(selected.id);
      if (tab) {
        tab.opener = null;
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
      onCheckoutOpened();
    } catch (err) {
      tab?.close();
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-float self-start border-0 bg-gradient-to-br from-[#b8560f] to-[#9a470c] p-8 text-white">
      <p className="flex items-center gap-2 text-xl font-semibold">
        <IconCrown size="1.4rem" aria-hidden /> Premium
      </p>

      {plans.isPending ? (
        <Skeleton className="mt-6 h-24 bg-white/20" />
      ) : !selected ? (
        <p className="mt-6 text-lg">Os planos estão indisponíveis no momento. Tente novamente mais tarde.</p>
      ) : (
        <>
          {monthly && yearly && (
            <Segmented<BillingPeriod>
              label="Periodicidade"
              value={period}
              onChange={setPeriod}
              className="mt-6 bg-white/15"
              activeClass="bg-white text-[#9a470c]"
              options={[
                { value: "Monthly", label: <span className="text-inherit">Mensal</span> },
                {
                  value: "Yearly",
                  label: <span>Anual{savingPercent && savingPercent > 0 ? ` −${savingPercent}%` : ""}</span>,
                },
              ]}
            />
          )}
          <p className="mt-6 text-[3.2rem] leading-none font-bold tracking-tight">
            {formatMoney(selected.price)}
            <span className="text-2xl font-semibold">/{PERIOD_LABEL[selected.billingPeriod]}</span>
          </p>
          {selected.billingPeriod === "Yearly" && (
            <p className="mt-2 text-lg">Equivale a {formatMoney(selected.price / 12)} por mês</p>
          )}
        </>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {PREMIUM_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3 text-lg">
            <IconCheck size="1.3rem" className="mt-1 shrink-0" aria-hidden /> {benefit}
          </li>
        ))}
      </ul>

      {Boolean(error) && (
        <div className="mt-6 rounded-2xl bg-white p-1">
          <ActionError error={error} />
        </div>
      )}

      <Button
        onClick={subscribe}
        loading={loading}
        // Never locked: a checkout closed without paying must not keep the user from trying again.
        disabled={!selected}
        block
        className="mt-8 bg-white text-[#9a470c] hover:bg-white/90"
      >
        {awaiting ? "Abrir o pagamento de novo" : "Assinar Premium"}
      </Button>
      <p className="mt-4 text-center">
        Pagamento seguro pelo Pagar.me, no cartão de crédito. Cancele quando quiser: o Premium continua até o
        fim do período já pago.
      </p>
    </Card>
  );
}

/* ---------------- Premium ---------------- */

function PremiumCard({ subscription: s }: { subscription: CurrentSubscription }) {
  const client = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const failed = s.status === SubscriptionStatus.PaymentFailed || Boolean(s.paymentGraceUntil);
  const scheduled = s.cancelAtPeriodEnd;
  const period = s.billingPeriod ? PERIOD_LABEL[s.billingPeriod] : undefined;

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      await client.invalidateQueries({ queryKey: ["subscription"] });
      setConfirming(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted">Seu plano atual</p>
          <h2 className="text-ink flex items-center gap-2 text-[2.2rem] font-bold">
            <IconCrown size="1.8rem" className="text-brand-700" aria-hidden /> Premium
          </h2>
          {s.price > 0 && period && (
            <p className="text-muted text-lg">
              {formatMoney(s.price)}/{period}
            </p>
          )}
        </div>
        <span
          className={clsx(
            "rounded-full px-4 py-1.5 font-semibold",
            failed
              ? "bg-expense-soft text-expense"
              : scheduled
                ? "bg-warning-soft text-warning-ink"
                : "bg-income-soft text-income",
          )}
        >
          {failed ? "Pagamento recusado" : scheduled ? "Cancelamento agendado" : "Ativo"}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {failed && s.paymentGraceUntil && (
          <Alert>
            <span className="flex items-start gap-2">
              <IconAlertTriangle size="1.2rem" className="mt-0.5 shrink-0" aria-hidden />A última cobrança foi
              recusada pelo cartão. Vamos tentar de novo; se não der certo, o Premium termina em{" "}
              {formatApiDate(s.paymentGraceUntil)}.
            </span>
          </Alert>
        )}
        {scheduled ? (
          <p className="text-ink text-lg">
            Você cancelou a renovação. O Premium continua até{" "}
            <strong>
              {formatApiDate(s.accessEndsAt ?? s.cancellationScheduledFor ?? s.nextBillingDate ?? "")}
            </strong>{" "}
            e depois sua conta volta para o plano Gratuito, sem nova cobrança.
          </p>
        ) : (
          s.nextBillingDate && (
            <p className="text-ink text-lg">
              Próxima cobrança em <strong>{formatApiDate(s.nextBillingDate)}</strong>
              {s.price > 0 && <> no valor de {formatMoney(s.price)}</>}.
            </p>
          )
        )}
        {s.startsAt && <p className="text-muted">Assinante desde {formatApiDate(s.startsAt)}.</p>}
        {error && <Alert>{error}</Alert>}
      </div>

      <div className="mt-8">
        {scheduled ? (
          <Button onClick={() => run(reactivateSubscription)} loading={busy}>
            Manter o Premium
          </Button>
        ) : (
          s.status === SubscriptionStatus.Active && (
            <Button variant="outline" onClick={() => setConfirming(true)}>
              Cancelar assinatura
            </Button>
          )
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Cancelar a assinatura?"
        message={
          <>
            Não haverá novas cobranças. Você continua com o Premium até{" "}
            <strong className="text-ink">
              {s.nextBillingDate ? formatApiDate(s.nextBillingDate) : "o fim do período pago"}
            </strong>{" "}
            e depois volta para o plano Gratuito. Seus dados continuam salvos, e você pode desfazer o
            cancelamento até lá.
          </>
        }
        confirmLabel="Cancelar assinatura"
        onConfirm={() => run(cancelSubscription)}
        onClose={() => setConfirming(false)}
        loading={busy}
        error={error}
      />
    </Card>
  );
}

/* ---------------- Histórico ---------------- */

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.Pending]: "Pagamento não concluído",
  [SubscriptionStatus.Active]: "Ativa",
  [SubscriptionStatus.PastDue]: "Em atraso",
  [SubscriptionStatus.Cancelled]: "Cancelada",
  [SubscriptionStatus.Expired]: "Encerrada",
  [SubscriptionStatus.PaymentFailed]: "Pagamento recusado",
};

function HistoryCard() {
  const history = useSubscriptionHistory();
  const items = [...(history.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Card className="self-start p-8">
      <h2 className="text-ink text-2xl font-bold">Histórico de assinaturas</h2>
      {history.isPending ? (
        <Skeleton className="mt-4 h-20" />
      ) : items.length === 0 ? (
        <p className="text-muted mt-3 text-lg">
          Você ainda não teve assinaturas. Os pagamentos são processados com segurança pelo Pagar.me.
        </p>
      ) : (
        <ul className="mt-4">
          {items.map((item) => (
            <li
              key={item.subscriptionId}
              className="border-line flex justify-between gap-4 border-b py-4 last:border-b-0"
            >
              <div>
                <p className="text-ink text-lg font-semibold">{item.planName}</p>
                <p className="text-muted">
                  {item.startsAt
                    ? `Desde ${formatApiDate(item.startsAt)}`
                    : `Criada em ${formatApiDate(item.createdAt)}`}
                  {item.endsAt ? ` · até ${formatApiDate(item.endsAt)}` : ""}
                </p>
              </div>
              <span className="text-muted text-right">
                {STATUS_LABEL[item.status] ?? item.statusDescription}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
