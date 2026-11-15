"use client";

import { IconArrowRight, IconPlus, IconReceipt, IconSparkles, IconTriangleFilled } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { MonthPicker } from "@/components/app/month-picker";
import { TransactionDialog } from "@/components/app/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Card, ProgressBar, Skeleton } from "@/components/ui/misc";
import {
  addMonths,
  currentYearMonth,
  firstName,
  formatMoney,
  formatPercent,
  monthLabel,
  relativeDay,
  type YearMonth,
} from "@/lib/format";
import { usePlanLimits, useProfile } from "@/lib/queries";
import { CategoryDonut, IncomeExpenseChart } from "@/components/app/charts";
import { useSavingsGoals } from "@/lib/goals";
import { isMonthAllowed, useExpensesByCategory, useMonthlySeries, type MonthBar } from "@/lib/summary";
import { CHART_MONTHS, useInsights, useLatestExpenses } from "./use-dashboard";

export function Dashboard() {
  const profile = useProfile();
  const limits = usePlanLimits();
  const [month, setMonth] = useState<YearMonth>(currentYearMonth);
  const [creating, setCreating] = useState(false);

  const series = useMonthlySeries(month, CHART_MONTHS);
  const current = series[series.length - 1];
  const previous = series[series.length - 2];
  const categories = useExpensesByCategory(month);

  const name = firstName(profile.data?.name);

  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      <PageHeader
        title={name ? `Olá, ${name}` : "Olá"}
        subtitle="Veja como estão suas finanças este mês"
        actions={
          <>
            <MonthPicker
              value={month}
              onChange={setMonth}
              canGoBack={isMonthAllowed(addMonths(month, -1), limits.data)}
            />
            <Button onClick={() => setCreating(true)}>
              <IconPlus size="1.2rem" aria-hidden /> Nova transação
            </Button>
          </>
        }
      />
      <TransactionDialog open={creating} onClose={() => setCreating(false)} />

      <BalancePanel current={current} previous={previous} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="p-6 sm:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-ink text-xl font-bold">Receitas x Despesas</h2>
            <span className="text-muted text-sm">Últimos 6 meses</span>
          </div>
          <div className="mt-5">
            {series.some((m) => m.loading) ? (
              <Skeleton className="h-72" />
            ) : (
              <IncomeExpenseChart months={series} />
            )}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <h2 className="text-ink text-xl font-bold">Despesas por categoria</h2>
          <div className="mt-6">
            {categories.isPending ? (
              <Skeleton className="h-64" />
            ) : categories.data && categories.data.length > 0 ? (
              <CategoryDonut data={categories.data} total={current.summary?.totalExpense ?? 0} />
            ) : (
              <EmptyState
                text={
                  categories.isError
                    ? "Não foi possível carregar as categorias."
                    : "Nenhuma despesa neste mês."
                }
              />
            )}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <LatestExpensesCard />
        <div className="flex flex-col gap-6">
          <SavingsGoalCard />
          <InsightCard month={month} />
        </div>
      </section>
    </div>
  );
}

/** Change vs. the previous month, colored by whether it is good news (more income, less spending). */
function Delta({
  value,
  previous,
  higherIsGood,
  onDark,
}: {
  value?: number;
  previous?: number;
  higherIsGood: boolean;
  onDark?: boolean;
}) {
  const change =
    value !== undefined && previous ? ((value - previous) / Math.abs(previous)) * 100 : undefined;
  if (change === undefined || !Number.isFinite(change)) return <span className="h-5" />;
  const up = change >= 0;
  const good = up === higherIsGood;
  return (
    <span
      className={clsx(
        "flex items-center gap-1.5 text-xs font-medium whitespace-nowrap sm:text-sm",
        onDark ? (good ? "text-[#7fd3a1]" : "text-[#f4a08a]") : good ? "text-income" : "text-expense",
      )}
    >
      <IconTriangleFilled size="0.7rem" className={clsx(!up && "rotate-180")} aria-hidden />
      <span className="sr-only">{up ? "Aumento de" : "Queda de"}</span>
      {formatPercent(Math.abs(Math.round(change)))} vs. mês anterior
    </span>
  );
}

/**
 * The month at a glance, on graphite: the balance set large, income and expenses beside it, and how much of
 * what came in has gone out (expenses ÷ income of the same month).
 */
function BalancePanel({ current, previous }: { current: MonthBar; previous?: MonthBar }) {
  const s = current.summary;
  const income = s?.totalIncome ?? 0;
  const expense = s?.totalExpense ?? 0;
  const spentShare = income > 0 ? Math.min(100, (expense / income) * 100) : expense > 0 ? 100 : 0;
  const month = monthLabel(current).split(" ")[0].toLowerCase();

  return (
    <section
      aria-label="Resumo do mês"
      className="bg-rail text-rail-ink shadow-card grid overflow-hidden rounded-[var(--radius-card)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-x-6"
    >
      <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
        <div>
          <p className="text-rail-muted text-[0.95rem]">Saldo de {month}</p>
          {current.loading ? (
            <Skeleton className="bg-rail-raised mt-3 h-14 w-72" />
          ) : (
            <p
              className={clsx(
                "figure mt-1 text-[2.6rem] leading-[1.05] font-bold sm:text-[3.6rem]",
                (s?.balance ?? 0) < 0 && "text-[#f4a08a]",
              )}
            >
              {formatMoney(s?.balance ?? 0)}
            </p>
          )}
          <div className="mt-2">
            <Delta value={s?.balance} previous={previous?.summary?.balance} higherIsGood onDark />
          </div>
        </div>

        <div>
          <div className="text-rail-muted flex items-baseline justify-between text-sm">
            <span>Gasto do que entrou</span>
            <span className="text-rail-ink font-semibold tabular-nums">
              {current.loading ? "—" : formatPercent(Math.round(spentShare))}
            </span>
          </div>
          <div
            className="bg-rail-raised mt-2 h-2 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Despesas em relação às receitas do mês"
            aria-valuenow={Math.round(spentShare)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={clsx("h-full rounded-full", spentShare >= 90 ? "bg-[#f08a70]" : "bg-brand-500")}
              style={{ width: `${spentShare}%` }}
            />
          </div>
        </div>
      </div>

      <dl className="border-rail-line grid grid-cols-2 border-t lg:grid-cols-1 lg:border-t-0 lg:border-l">
        <Flow
          label="Receitas"
          value={s?.totalIncome}
          delta={
            <Delta value={s?.totalIncome} previous={previous?.summary?.totalIncome} higherIsGood onDark />
          }
          dot="bg-[#4aab76]"
          loading={current.loading}
        />
        <Flow
          label="Despesas"
          value={s?.totalExpense}
          delta={
            <Delta
              value={s?.totalExpense}
              previous={previous?.summary?.totalExpense}
              higherIsGood={false}
              onDark
            />
          }
          dot="bg-[#e8957f]"
          loading={current.loading}
          className="border-rail-line border-l lg:border-t lg:border-l-0"
        />
      </dl>
    </section>
  );
}

function Flow({
  label,
  value,
  delta,
  dot,
  loading,
  className,
}: {
  label: string;
  value?: number;
  delta: React.ReactNode;
  dot: string;
  loading: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col justify-center gap-1 p-5 sm:px-8 sm:py-6", className)}>
      <dt className="text-rail-muted flex items-center gap-2 text-[0.95rem]">
        <span className={clsx("size-2 rounded-full", dot)} aria-hidden /> {label}
      </dt>
      <dd>
        {loading ? (
          <Skeleton className="bg-rail-raised mt-1 h-9 w-40" />
        ) : (
          <span className="figure block text-[1.5rem] font-bold sm:text-[2rem]">
            {formatMoney(value ?? 0)}
          </span>
        )}
        <span className="mt-1 block">{delta}</span>
      </dd>
    </div>
  );
}

function LatestExpensesCard() {
  const latest = useLatestExpenses(4);
  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-baseline justify-between">
        <h2 className="text-ink text-xl font-bold">Últimas despesas</h2>
        <Link
          href="/transacoes"
          className="text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 text-[0.95rem] font-semibold"
        >
          Ver todas <IconArrowRight size="1rem" aria-hidden />
        </Link>
      </div>
      {latest.isPending ? (
        <div className="mt-5 flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : latest.data && latest.data.length > 0 ? (
        <ul className="mt-3">
          {latest.data.map((expense) => (
            <li
              key={expense.id}
              className="border-line flex items-center gap-4 border-b py-4 last:border-b-0 last:pb-0"
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl"
                style={{ background: `${expense.color || "#c9674e"}1f`, color: expense.color || "#c9674e" }}
              >
                <IconReceipt size="1.2rem" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink truncate text-base font-medium">{expense.title}</p>
                <p className="text-muted text-sm">
                  {relativeDay(expense.expenseDate)} · {expense.category}
                </p>
              </div>
              <p className="text-ink text-base font-semibold whitespace-nowrap tabular-nums">
                − {formatMoney(expense.amount)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          text={
            latest.isError ? "Não foi possível carregar as despesas." : "Você ainda não registrou despesas."
          }
        />
      )}
    </Card>
  );
}

function SavingsGoalCard() {
  const goals = useSavingsGoals();
  const goal = goals.data?.find((g) => !g.isCompleted) ?? goals.data?.[0];

  if (goals.isPending) return <Skeleton className="h-40" />;

  if (!goal) {
    return (
      <Card className="p-6 sm:p-7">
        <h2 className="text-ink text-xl font-bold">Metas</h2>
        <p className="text-muted mt-2">Crie uma meta para acompanhar quanto falta para o seu objetivo.</p>
        <Link href="/metas" className="text-brand-700 hover:text-brand-800 mt-4 inline-block font-semibold">
          Criar meta
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7">
      <p className="text-muted text-sm">Meta</p>
      <div className="mt-0.5 flex items-baseline justify-between gap-4">
        <h2 className="text-ink truncate text-xl font-bold">{goal.name}</h2>
        <span className="figure text-brand-700 text-2xl font-bold">
          {formatPercent(Math.round(goal.percentage))}
        </span>
      </div>
      <ProgressBar value={goal.percentage} className="mt-4" label={`Progresso da meta ${goal.name}`} />
      <p className="text-muted mt-3 text-sm">
        <span className="text-ink font-semibold">{formatMoney(goal.savedAmount, { cents: false })}</span> de{" "}
        {formatMoney(goal.targetAmount, { cents: false })}
      </p>
    </Card>
  );
}

function InsightCard({ month }: { month: YearMonth }) {
  const insights = useInsights(month);
  const data = insights.data;
  const message = data?.artificialInsight?.message ?? data?.insights[0]?.message;

  if (insights.isPending) return <Skeleton className="h-44" />;
  if (!message) return null;

  return (
    <Card className="border-brand-500 relative overflow-hidden border-l-[3px] p-6 sm:p-7">
      <p className="text-brand-700 flex items-center gap-2 text-sm font-semibold">
        <IconSparkles size="1.1rem" aria-hidden />
        Mi Assistente
      </p>
      <p className="text-ink mt-3 text-[1.05rem] leading-relaxed">{message}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Link
          href="/assistente"
          className="text-ink hover:text-brand-700 inline-flex items-center gap-1 text-[0.95rem] font-semibold"
        >
          Perguntar ao Mi <IconArrowRight size="1rem" aria-hidden />
        </Link>
        {data?.isPreview && data.lockedInsightsCount > 0 && (
          <Link
            href="/assinatura"
            className="text-brand-700 hover:text-brand-800 text-[0.95rem] font-semibold"
          >
            +{data.lockedInsightsCount} {data.lockedInsightsCount === 1 ? "dica" : "dicas"} com análise
            completa no Premium
          </Link>
        )}
      </div>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-muted py-10 text-center">{text}</p>;
}
